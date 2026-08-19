from itertools import zip_longest

from shared_libs.models.base_models import DomainRepositoryQueryModel


def batcher(iterable, n):
    args = [iter(iterable)] * n
    return zip_longest(*args)


def is_projected_query(domain_query_model: DomainRepositoryQueryModel) -> bool:
    projection = domain_query_model.projection
    if not projection:
        return False

    if isinstance(projection, dict):
        return any(
            field != "_id" or include not in (False, 0)
            for field, include in projection.items()
        )

    return True


__all__ = ["batcher", "is_projected_query"]
