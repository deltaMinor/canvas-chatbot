from typing import Any, Protocol


class NetworkGraphProtocol(Protocol):
    """Structural interface for a network graph builder/parser.

    Any object exposing this surface (regardless of concrete class) can be
    used wherever a network graph is expected, e.g. by `AttackFlow` or
    `ArchitectureProcessor`.
    """

    G: Any

    def _add_host_node(self, host_name: str) -> None:
        """Add a host node to the graph if it does not already exist."""
        ...

    def set_connection_child_of_multi(self, node_name: str, parent_name: str) -> None:
        """Record a transitive child-of relationship between two nodes."""
        ...

    def set_connection_child_of(self, node_name: str, parent_name: str) -> None:
        """Record a direct child-of relationship between two nodes."""
        ...

    def set_connection_virtual_guest(
        self, parent_name: str, node_name: str, virtual_guest: Any
    ) -> None:
        """Record a virtual guest (VM/container) relationship."""
        ...

    def set_connection_physical_privilege(
        self, parent_name: str, node_name: str
    ) -> None:
        """Record a physical privilege connection between two nodes."""
        ...

    def set_connection(self, source_name: str, target_name: str) -> None:
        """Record a generic connection edge between two nodes."""
        ...

    def set_connection_host_dataflow(
        self, source_name: str, target_name: str, inherit: bool = False
    ) -> None:
        """Record a dataflow connection edge between two nodes."""
        ...

    def set_located(self, node_name: str, parent_name: str) -> None:
        """Record that a node is located at/within another node."""
        ...

    def set_host_node_type(self, node_name: str, node_type: Any) -> None:
        """Assign a `NodeType` classification to a host node."""
        ...

    def set_host_data_store(self, node_name: str, data_label: str) -> None:
        """Record that a host node stores the given labelled data."""
        ...

    def set_host_network_service(self, node_name: str) -> None:
        """Mark a host node as exposing a network service."""
        ...

    def set_host_account(
        self, node_name: str, account_name: str, privilege: Any
    ) -> None:
        """Attach an account with a privilege level to a host node."""
        ...

    def set_user_interaction(
        self, account_name: str, source_name: str, target_name: str
    ) -> None:
        """Record a user-interaction requirement between two nodes."""
        ...

    def set_host_vulnerability(self, node_name: str, cve_id: str) -> None:
        """Attach a vulnerability (CVE) reference to a host node."""
        ...

    def set_host_exec_code(self, node_name: str, privilege: Any) -> None:
        """Record that a node grants code execution at the given privilege."""
        ...

    def set_host_has_app_access(self, node_name: str, access: Any) -> None:
        """Record that a node grants application access of the given kind."""
        ...

    def set_net_control(self, node_name: str, control: Any) -> None:
        """Record a network control capability on a node."""
        ...

    def set_host_dataflow_data(self, node_name: str, dataflow_data: Any) -> None:
        """Attach dataflow data metadata to a host node."""
        ...

    def upload_vulnerability(self, cve_json: Any) -> None:
        """Load mapped CVE precondition/postcondition data into the graph."""
        ...

    def parse_networkgraph(self) -> str:
        """Serialize the graph into the XSB logic-engine input format."""
        ...


__all__ = ["NetworkGraphProtocol"]
