-- Layout Storage Handlers for ao Process
-- Implements SQLite storage for layout data based on the schema structure

-- Check if SQLite is available
local sqlite = require('lsqlite3')
if not sqlite then
  error("SQLite not available. Make sure you're using: aos myprocess --sqlite")
end

-- Initialize database
Db = sqlite.open_memory()
if not Db then
  error("Failed to create SQLite database")
end

-- Try to use DbAdmin, fall back to direct SQLite if it fails
local dbAdmin = nil
local useDbAdmin = false

local success, DbAdminModule = pcall(require, '@rakis/DbAdmin')
if success and DbAdminModule then
  local adminSuccess, admin = pcall(DbAdminModule.new, DbAdminModule, Db)
  if adminSuccess and admin then
    dbAdmin = admin
    useDbAdmin = true
    print("✅ Using DbAdmin for database operations")
  else
    print("⚠️  DbAdmin creation failed, using direct SQLite")
  end
else
  print("⚠️  DbAdmin not available, using direct SQLite")
end

-- Database operation wrapper with better DbAdmin error handling
local function execSQL(sql, params)
  if useDbAdmin then
    local success, result = pcall(function()
      if params then
        return dbAdmin:apply(sql, params)
      else
        return dbAdmin:exec(sql)
      end
    end)
    
    if not success then
      -- DbAdmin failed, fall back to direct SQLite
      print("⚠️  DbAdmin operation failed, falling back to direct SQLite: " .. tostring(result))
      useDbAdmin = false
      return execSQL(sql, params) -- Recursive call with direct SQLite
    end
    
    return result
  else
    -- Direct SQLite approach
    local stmt = Db:prepare(sql)
    if not stmt then
      return nil, "Failed to prepare statement: " .. Db:errmsg()
    end
    
    if params then
      for i, param in ipairs(params) do
        stmt:bind(i, param)
      end
    end
    
    local result = stmt:step()
    stmt:finalize()
    
    if result == sqlite.DONE or result == sqlite.ROW then
      return true
    else
      return nil, "SQL execution failed: " .. Db:errmsg()
    end
  end
end

-- Query wrapper for SELECT statements with better DbAdmin error handling
local function querySQL(sql, params)
  if useDbAdmin then
    local success, result = pcall(function()
      return dbAdmin:exec(sql, params)
    end)
    
    if not success then
      -- DbAdmin failed, fall back to direct SQLite
      print("⚠️  DbAdmin query failed, falling back to direct SQLite: " .. tostring(result))
      useDbAdmin = false
      return querySQL(sql, params) -- Recursive call with direct SQLite
    end
    
    return result
  else
    -- Direct SQLite approach for queries
    local stmt = Db:prepare(sql)
    if not stmt then
      return nil, "Failed to prepare query: " .. Db:errmsg()
    end
    
    if params then
      for i, param in ipairs(params) do
        stmt:bind(i, param)
      end
    end
    
    local results = {}
    while stmt:step() == sqlite.ROW do
      local row = {}
      for i = 0, stmt:columns() - 1 do
        local colName = stmt:get_name(i)
        row[colName] = stmt:get_value(i)
      end
      table.insert(results, row)
    end
    stmt:finalize()
    
    return results
  end
end

-- Create tables to match the layout schema structure
local createLayoutsSQL = [[
  CREATE TABLE IF NOT EXISTS Layouts (
    id TEXT PRIMARY KEY,
    tileSize_width INTEGER NOT NULL,
    tileSize_height INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 2,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
]]

local createNodesSQL = [[
  CREATE TABLE IF NOT EXISTS LayoutNodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    layout_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    frame_x REAL NOT NULL,
    frame_y REAL NOT NULL,
    frame_width REAL NOT NULL,
    frame_height REAL NOT NULL,
    zIndex INTEGER NOT NULL DEFAULT 0,
    type TEXT,
    src TEXT,
    caption TEXT,
    aspectRatio REAL,
    rotation REAL DEFAULT 0,
    FOREIGN KEY (layout_id) REFERENCES Layouts(id) ON DELETE CASCADE
  );
]]

local createIndexSQL = [[
  CREATE INDEX IF NOT EXISTS idx_layout_nodes_layout_id ON LayoutNodes(layout_id);
]]

-- Execute table creation with safe error handling
print("Creating database tables...")

local success1, error1 = execSQL(createLayoutsSQL)
if not success1 then
  print("❌ Failed to create Layouts table: " .. (error1 or "unknown error"))
  print("Database mode: " .. (useDbAdmin and "DbAdmin" or "Direct SQLite"))
  error("Cannot continue without Layouts table")
end
print("✅ Layouts table created")

local success2, error2 = execSQL(createNodesSQL)
if not success2 then
  print("❌ Failed to create LayoutNodes table: " .. (error2 or "unknown error"))
  print("Database mode: " .. (useDbAdmin and "DbAdmin" or "Direct SQLite"))
  error("Cannot continue without LayoutNodes table")
end
print("✅ LayoutNodes table created")

local success3, error3 = execSQL(createIndexSQL)
if not success3 then
  print("⚠️  Warning: Failed to create index: " .. (error3 or "unknown error"))
  print("Database will work but may be slower without indexes")
else
  print("✅ Database indexes created")
end

print("✅ Database initialization completed successfully!")
print("Database mode: " .. (useDbAdmin and "DbAdmin" or "Direct SQLite"))

-- Helper function to serialize simple data
local function serializeData(data)
  if data == nil then return nil end
  return tostring(data)
end

-- Helper function to convert string to number if possible
local function toNumberOrString(str)
  if str == nil or str == "" then return nil end
  local num = tonumber(str)
  return num or str
end

-- WRITE HANDLER: Save layout to database
Handlers.add(
  "SaveLayout",
  Handlers.utils.hasMatchingTag("Action", "SaveLayout"),
  function(msg)
    -- Get layout data from tags
    local layoutId = msg.Tags.LayoutId
    local tileWidth = tonumber(msg.Tags.TileWidth)
    local tileHeight = tonumber(msg.Tags.TileHeight)
    local version = tonumber(msg.Tags.Version) or 2
    
    -- Validate required fields
    if not layoutId or not tileWidth or not tileHeight then
      msg.reply({
        Data = "Missing required tags: LayoutId=" .. tostring(layoutId) .. 
               ", TileWidth=" .. tostring(tileWidth) .. 
               ", TileHeight=" .. tostring(tileHeight),
        Tags = {
          Action = "SaveLayout-Response",
          Status = "Error"
        }
      })
      return
    end
    
    -- Begin transaction
    local beginSuccess, beginError = execSQL("BEGIN TRANSACTION;")
    if not beginSuccess then
      msg.reply({
        Data = "Failed to begin transaction: " .. (beginError or "unknown error"),
        Tags = {
          Action = "SaveLayout-Response",
          Status = "Error"
        }
      })
      return
    end
    
    -- Insert layout
    local insertLayoutSQL = "INSERT OR REPLACE INTO Layouts (id, tileSize_width, tileSize_height, version) VALUES (?, ?, ?, ?);"
    local layoutResult, layoutError = execSQL(insertLayoutSQL, {
      layoutId,
      tileWidth,
      tileHeight,
      version
    })
    
    if not layoutResult then
      execSQL("ROLLBACK;")
      msg.reply({
        Data = "Failed to save layout: " .. (layoutError or "unknown error"),
        Tags = {
          Action = "SaveLayout-Response",
          Status = "Error"
        }
      })
      return
    end
    
    -- Delete existing nodes for this layout
    local deleteNodesSQL = "DELETE FROM LayoutNodes WHERE layout_id = ?;"
    execSQL(deleteNodesSQL, { layoutId })
    
    -- Commit transaction
    local commitSuccess, commitError = execSQL("COMMIT;")
    if not commitSuccess then
      msg.reply({
        Data = "Failed to commit transaction: " .. (commitError or "unknown error"),
        Tags = {
          Action = "SaveLayout-Response",
          Status = "Error"
        }
      })
      return
    end
    
    msg.reply({
      Data = "Layout saved successfully: " .. layoutId,
      Tags = {
        Action = "SaveLayout-Response",
        Status = "Success",
        LayoutId = layoutId
      }
    })
  end
)

-- WRITE HANDLER: Add node to layout
Handlers.add(
  "AddNode",
  Handlers.utils.hasMatchingTag("Action", "AddNode"),
  function(msg)
    -- Get node data from tags
    local layoutId = msg.Tags.LayoutId
    local nodeId = msg.Tags.NodeId
    local frameX = tonumber(msg.Tags.FrameX)
    local frameY = tonumber(msg.Tags.FrameY)
    local frameWidth = tonumber(msg.Tags.FrameWidth)
    local frameHeight = tonumber(msg.Tags.FrameHeight)
    local zIndex = tonumber(msg.Tags.ZIndex) or 0
    local nodeType = msg.Tags.Type
    local src = msg.Tags.Src
    local caption = msg.Tags.Caption
    local aspectRatio = tonumber(msg.Tags.AspectRatio)
    local rotation = tonumber(msg.Tags.Rotation) or 0
    
    -- Validate required fields
    if not layoutId or not nodeId or not frameX or not frameY or not frameWidth or not frameHeight then
      msg.reply({
        Data = "Missing required tags: LayoutId=" .. tostring(layoutId) .. 
               ", NodeId=" .. tostring(nodeId) .. 
               ", FrameX=" .. tostring(frameX) .. 
               ", FrameY=" .. tostring(frameY) .. 
               ", FrameWidth=" .. tostring(frameWidth) .. 
               ", FrameHeight=" .. tostring(frameHeight),
        Tags = {
          Action = "AddNode-Response",
          Status = "Error"
        }
      })
      return
    end
    
    -- Insert node
    local insertNodeSQL = [[
      INSERT OR REPLACE INTO LayoutNodes (
        layout_id, node_id, frame_x, frame_y, frame_width, frame_height,
        zIndex, type, src, caption, aspectRatio, rotation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    ]]
    
    local nodeResult, nodeError = execSQL(insertNodeSQL, {
      layoutId,
      nodeId,
      frameX,
      frameY,
      frameWidth,
      frameHeight,
      zIndex,
      nodeType,
      src,
      caption,
      aspectRatio,
      rotation
    })
    
    if nodeResult then
      msg.reply({
        Data = "Node added successfully: " .. nodeId,
        Tags = {
          Action = "AddNode-Response",
          Status = "Success",
          LayoutId = layoutId,
          NodeId = nodeId
        }
      })
    else
      msg.reply({
        Data = "Failed to add node: " .. nodeId .. " - " .. (nodeError or "unknown error"),
        Tags = {
          Action = "AddNode-Response",
          Status = "Error"
        }
      })
    end
  end
)

-- READ HANDLER: Retrieve layout from database
Handlers.add(
  "GetLayout",
  Handlers.utils.hasMatchingTag("Action", "GetLayout"),
  function(msg)
    local layoutId = msg.Tags.LayoutId
    
    if not layoutId then
      msg.reply({
        Data = "LayoutId tag is required",
        Tags = {
          Action = "GetLayout-Response",
          Status = "Error"
        }
      })
      return
    end
    
    -- Get layout metadata
    local layoutSQL = "SELECT * FROM Layouts WHERE id = ?;"
    local layoutRows = querySQL(layoutSQL, { layoutId })
    
    if not layoutRows or #layoutRows == 0 then
      msg.reply({
        Data = "Layout not found: " .. layoutId,
        Tags = {
          Action = "GetLayout-Response",
          Status = "NotFound"
        }
      })
      return
    end
    
    local layoutRow = layoutRows[1]
    
    -- Get layout nodes
    local nodesSQL = "SELECT * FROM LayoutNodes WHERE layout_id = ? ORDER BY zIndex ASC;"
    local nodeRows = querySQL(nodesSQL, { layoutId })
    
    -- Create response data string
    local responseData = "Layout: " .. layoutRow.id .. "\n"
    responseData = responseData .. "TileSize: " .. layoutRow.tileSize_width .. "x" .. layoutRow.tileSize_height .. "\n"
    responseData = responseData .. "Version: " .. layoutRow.version .. "\n"
    responseData = responseData .. "Nodes: " .. (nodeRows and #nodeRows or 0) .. "\n"
    
    if nodeRows and #nodeRows > 0 then
      responseData = responseData .. "Node Details:\n"
      for _, nodeRow in ipairs(nodeRows) do
        responseData = responseData .. "- " .. nodeRow.node_id .. 
          " (" .. nodeRow.frame_x .. "," .. nodeRow.frame_y .. 
          " " .. nodeRow.frame_width .. "x" .. nodeRow.frame_height .. ")" ..
          " z:" .. nodeRow.zIndex
        if nodeRow.type then
          responseData = responseData .. " type:" .. nodeRow.type
        end
        if nodeRow.src then
          responseData = responseData .. " src:" .. nodeRow.src
        end
        responseData = responseData .. "\n"
      end
    end
    
    msg.reply({
      Data = responseData,
      Tags = {
        Action = "GetLayout-Response",
        Status = "Success",
        LayoutId = layoutId,
        TileWidth = tostring(layoutRow.tileSize_width),
        TileHeight = tostring(layoutRow.tileSize_height),
        Version = tostring(layoutRow.version),
        NodeCount = tostring(nodeRows and #nodeRows or 0)
      }
    })
  end
)

-- BONUS: List all layouts handler
Handlers.add(
  "ListLayouts",
  Handlers.utils.hasMatchingTag("Action", "ListLayouts"),
  function(msg)
    local limit = tonumber(msg.Tags.Limit) or 50
    local offset = tonumber(msg.Tags.Offset) or 0
    
    local layoutsSQL = [[
      SELECT l.id, l.tileSize_width, l.tileSize_height, l.version, l.created_at,
             COUNT(n.id) as node_count
      FROM Layouts l
      LEFT JOIN LayoutNodes n ON l.id = n.layout_id
      GROUP BY l.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?;
    ]]
    
    local layoutRows = querySQL(layoutsSQL, { limit, offset })
    
    local responseData = "Available Layouts:\n"
    local count = 0
    
    if layoutRows then
      for _, row in ipairs(layoutRows) do
        count = count + 1
        responseData = responseData .. count .. ". " .. row.id .. 
          " (" .. row.tileSize_width .. "x" .. row.tileSize_height .. 
          ") v" .. row.version .. 
          " [" .. row.node_count .. " nodes]\n"
      end
    end
    
    if count == 0 then
      responseData = "No layouts found"
    end
    
    msg.reply({
      Data = responseData,
      Tags = {
        Action = "ListLayouts-Response",
        Status = "Success",
        Count = tostring(count)
      }
    })
  end
)

-- BONUS: Delete layout handler
Handlers.add(
  "DeleteLayout",
  Handlers.utils.hasMatchingTag("Action", "DeleteLayout"),
  function(msg)
    local layoutId = msg.Tags.LayoutId
    
    if not layoutId then
      msg.reply({
        Data = "LayoutId tag is required",
        Tags = {
          Action = "DeleteLayout-Response",
          Status = "Error"
        }
      })
      return
    end
    
    -- Delete layout (nodes will be deleted by CASCADE)
    local deleteSQL = "DELETE FROM Layouts WHERE id = ?;"
    local result, deleteError = execSQL(deleteSQL, { layoutId })
    
    if result then
      msg.reply({
        Data = "Layout deleted successfully: " .. layoutId,
        Tags = {
          Action = "DeleteLayout-Response",
          Status = "Success",
          LayoutId = layoutId
        }
      })
    else
      msg.reply({
        Data = "Failed to delete layout: " .. layoutId .. " - " .. (deleteError or "unknown error"),
        Tags = {
          Action = "DeleteLayout-Response",
          Status = "Error"
        }
      })
    end
  end
)

print("Layout storage handlers initialized successfully!")
print("Available actions:")
print("  - SaveLayout: Create layout with LayoutId, TileWidth, TileHeight tags")
print("  - AddNode: Add node with LayoutId, NodeId, FrameX, FrameY, FrameWidth, FrameHeight, etc.")
print("  - GetLayout: Retrieve layout with LayoutId tag")
print("  - ListLayouts: List all layouts")
print("  - DeleteLayout: Delete layout with LayoutId tag")
