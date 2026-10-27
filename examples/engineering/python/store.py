"""Synthetic owner-scoped records; SQLite is the real test boundary."""
import sqlite3

def open_store(path):
    db = sqlite3.connect(path)
    db.execute('CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, owner TEXT, value INTEGER CHECK(value >= 0))')
    db.execute("INSERT OR IGNORE INTO records VALUES ('r1', 'alice', 10)")
    db.commit()
    return db

def update_record(db, caller, record_id, value, fail_after_write=False):
    if not valid_value(value):
        raise ValueError('nonnegative integer required')
    # Authorize the persisted record, not a caller-supplied owner label.
    with db:
        row = db.execute('SELECT owner FROM records WHERE id=?', (record_id,)).fetchone()
        if row is None or row[0] != caller:
            raise PermissionError('record unavailable')
        db.execute('UPDATE records SET value=? WHERE id=?', (value, record_id))
        if fail_after_write:
            raise RuntimeError('synthetic storage failure')
    return value

def read_record(db, caller, record_id):
    row = db.execute('SELECT owner,value FROM records WHERE id=?', (record_id,)).fetchone()
    if row is None or row[0] != caller:
        raise PermissionError('record unavailable')
    return row[1]

def valid_value(value):
    return isinstance(value, int) and value >= 0
