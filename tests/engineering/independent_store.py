"""Independent synthetic SQLite behavior; no project or production data."""
import importlib
import os
import pytest

store = importlib.import_module('store')
candidate = importlib.import_module(os.environ.get('QA_STORE_IMPLEMENTATION', 'store'))

@pytest.mark.functional
@pytest.mark.integration
def test_valid_owner_update_is_not_denied_by_weak_fix(tmp_path):
    db = store.open_store(tmp_path / 'qa.sqlite')
    try:
        assert candidate.update_record(db, 'alice', 'r1', 0) == 0
        assert store.read_record(db, 'alice', 'r1') == 0
    finally:
        db.close()

@pytest.mark.functional
@pytest.mark.integration
def test_cross_owner_write_and_read_do_not_reveal_or_mutate(tmp_path):
    db = store.open_store(tmp_path / 'qa.sqlite')
    try:
        db.execute("INSERT INTO records VALUES ('r2', 'bob', 20)")
        db.commit()
        with pytest.raises(PermissionError):
            candidate.update_record(db, 'alice', 'r2', 700)
        with pytest.raises(PermissionError):
            store.read_record(db, 'alice', 'r2')
        assert store.read_record(db, 'bob', 'r2') == 20
        assert store.read_record(db, 'alice', 'r1') == 10
    finally:
        db.close()

@pytest.mark.functional
@pytest.mark.integration
def test_failure_rollback_is_persisted_and_connection_remains_usable(tmp_path):
    dbpath = tmp_path / 'qa.sqlite'
    db = store.open_store(dbpath)
    try:
        assert candidate.update_record(db, 'alice', 'r1', 18) == 18
        with pytest.raises(RuntimeError):
            candidate.update_record(db, 'alice', 'r1', 89, fail_after_write=True)
        observer = store.open_store(dbpath)
        try:
            assert store.read_record(observer, 'alice', 'r1') == 18
        finally:
            observer.close()
        assert candidate.update_record(db, 'alice', 'r1', 21) == 21
        assert store.read_record(db, 'alice', 'r1') == 21
    finally:
        db.close()

@pytest.mark.integration
def test_invalid_input_and_missing_record_leave_existing_record_unchanged(tmp_path):
    db = store.open_store(tmp_path / 'qa.sqlite')
    try:
        for value in [-1, '2', None]:
            with pytest.raises(ValueError):
                candidate.update_record(db, 'alice', 'r1', value)
        with pytest.raises(PermissionError):
            candidate.update_record(db, 'alice', 'absent', 3)
        assert store.read_record(db, 'alice', 'r1') == 10
    finally:
        db.close()
