"""Intentionally uncalled module: must remain in coverage denominator."""
def fallback(value):
    if value:
        return 'present'
    return 'missing'
