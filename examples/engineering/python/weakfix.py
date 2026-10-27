"""Deliberately insufficient repair for independent QA; never the production path."""
def update_record(db, caller, record_id, value, fail_after_write=False):
    raise PermissionError('deny everything')
