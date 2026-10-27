import importlib
import os
import pytest
from store import open_store, read_record, valid_value
update_record = importlib.import_module(os.environ.get('PADF_STORE_IMPLEMENTATION', 'store')).update_record

@pytest.mark.unit
@pytest.mark.parametrize('value,expected', [(0, True), (2, True), (-1, False), ('text', False)])
def test_value_rule(value, expected):
    assert valid_value(value) is expected

@pytest.mark.functional
@pytest.mark.integration
def test_owner_can_update_and_read(tmp_path):
    with open_store(tmp_path / 'store.sqlite') as db:
        assert update_record(db, 'alice', 'r1', 25) == 25
        assert read_record(db, 'alice', 'r1') == 25

@pytest.mark.functional
@pytest.mark.integration
def test_other_owner_cannot_change_record(tmp_path):
    with open_store(tmp_path / 'store.sqlite') as db:
        with pytest.raises(PermissionError):
            update_record(db, 'bob', 'r1', 99)
        assert read_record(db, 'alice', 'r1') == 10
        with pytest.raises(PermissionError):
            read_record(db, 'bob', 'r1')

@pytest.mark.functional
@pytest.mark.integration
def test_failure_rolls_back_and_connection_recovers(tmp_path):
    with open_store(tmp_path / 'store.sqlite') as db:
        with pytest.raises(RuntimeError):
            update_record(db, 'alice', 'r1', 50, fail_after_write=True)
        assert read_record(db, 'alice', 'r1') == 10
        assert update_record(db, 'alice', 'r1', 30) == 30

@pytest.mark.integration
def test_invalid_value_preserves_data(tmp_path):
    with open_store(tmp_path / 'store.sqlite') as db:
        with pytest.raises(ValueError):
            update_record(db, 'alice', 'r1', -1)
        assert read_record(db, 'alice', 'r1') == 10
