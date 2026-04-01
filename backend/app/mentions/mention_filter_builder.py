from app.mentions.mention_record import MentionRecord


def build_mention_filters(query, filters):
    """Apply optional filters to a SQLAlchemy query on MentionRecord."""
    if filters is None:
        return query
    if filters.model is not None:
        query = query.where(MentionRecord.model == filters.model)
    if filters.sentiment is not None:
        query = query.where(MentionRecord.sentiment == filters.sentiment)
    if filters.mentioned is not None:
        query = query.where(MentionRecord.mentioned == filters.mentioned)
    if filters.date_from is not None:
        query = query.where(MentionRecord.created_at >= filters.date_from.isoformat())
    if filters.date_to is not None:
        query = query.where(MentionRecord.created_at <= filters.date_to.isoformat() + " 23:59:59")
    return query
