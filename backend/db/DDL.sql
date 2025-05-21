-- 强制外键
PRAGMA
foreign_keys = ON;
-- 开启 WAL 以提升并发
PRAGMA
journal_mode = WAL;

------------------------------------------------------------
-- 1. users
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users
(
    id
    TEXT
    PRIMARY
    KEY,
    is_guest
    INTEGER
    DEFAULT
    1,
    created_at
    INTEGER -- epoch ms
);

------------------------------------------------------------
-- 2. conversations   (不绑定 user)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations
(
    id
    TEXT
    PRIMARY
    KEY,
    title
    TEXT,
    created_at
    INTEGER
);

------------------------------------------------------------
-- 3. branches  (主干/分支树)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS branches
(
    id
    TEXT
    PRIMARY
    KEY,
    conversation_id
    TEXT
    NOT
    NULL,
    parent_branch_id
    TEXT, -- NULL = 主干
    root_message_id
    TEXT
    NOT
    NULL, -- 分支锚点
    title
    TEXT,
    created_at
    INTEGER,
    FOREIGN
    KEY
(
    conversation_id
) REFERENCES conversations
(
    id
) ON DELETE CASCADE,
    FOREIGN KEY
(
    parent_branch_id
) REFERENCES branches
(
    id
)
  ON DELETE CASCADE
    );

------------------------------------------------------------
-- 4. messages
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages
(
    id
    TEXT
    PRIMARY
    KEY,
    conversation_id
    TEXT
    NOT
    NULL,
    branch_id
    TEXT, -- 主干 NULL
    parent_id
    TEXT, -- 树状
    role
    TEXT
    CHECK (
    role
    IN
(
    'user',
    'assistant',
    'system'
)) NOT NULL,
    content TEXT NOT NULL,
    model TEXT,
    tokens INTEGER,
    status TEXT DEFAULT 'done',
    created_at INTEGER DEFAULT
(
    strftime
(
    '%s',
    'now'
)*1000),
    FOREIGN KEY
(
    conversation_id
) REFERENCES conversations
(
    id
) ON DELETE CASCADE,
    FOREIGN KEY
(
    branch_id
) REFERENCES branches
(
    id
)
  ON DELETE CASCADE,
    FOREIGN KEY
(
    parent_id
) REFERENCES messages
(
    id
)
  ON DELETE SET NULL
    );

------------------------------------------------------------
-- 5. message_branch (多分支引用，可选)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_branch
(
    message_id
    TEXT,
    branch_id
    TEXT,
    PRIMARY
    KEY
(
    message_id,
    branch_id
),
    FOREIGN KEY
(
    message_id
) REFERENCES messages
(
    id
) ON DELETE CASCADE,
    FOREIGN KEY
(
    branch_id
) REFERENCES branches
(
    id
)
  ON DELETE CASCADE
    );

------------------------------------------------------------
-- 6. 可选：user_conversations (订阅)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_conversations
(
    user_id
    TEXT,
    conversation_id
    TEXT,
    PRIMARY
    KEY
(
    user_id,
    conversation_id
),
    FOREIGN KEY
(
    user_id
) REFERENCES users
(
    id
) ON DELETE CASCADE,
    FOREIGN KEY
(
    conversation_id
) REFERENCES conversations
(
    id
)
  ON DELETE CASCADE
    );

------------------------------------------------------------
-- 7. Indices
------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_msg_conv_time ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_msg_branch ON messages(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_conv ON branches(conversation_id);
CREATE INDEX IF NOT EXISTS idx_map_branch ON message_branch(branch_id);
