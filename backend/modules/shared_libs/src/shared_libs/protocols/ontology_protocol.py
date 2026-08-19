from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class OntologyProtocol(Protocol):
    """Structural protocol for an owlready2 ``Ontology`` object.

    Covers the subset of ``owlready2.Ontology`` that is actually called in
    this codebase.  Using this protocol instead of importing
    ``owlready2.Ontology`` directly means that modules which only need the
    type annotation for static analysis do not have to declare ``owlready2``
    as a runtime dependency.
    """

    def __getitem__(self, key: str) -> Any:
        """Look up a class or individual by name."""
        ...

    def get_parents_of(self, entity: Any) -> list[Any]:
        """Return the direct parent classes of *entity* in the ontology."""
        ...

    def individuals(self) -> Any:
        """Return an iterable of all individuals in the ontology."""
        ...

    def search(self, **kwargs: Any) -> Any:
        """Search the ontology by criteria (e.g. ``subclass_of=``)."""
        ...


__all__ = ["OntologyProtocol"]
