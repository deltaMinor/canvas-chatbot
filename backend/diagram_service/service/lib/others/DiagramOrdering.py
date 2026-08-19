from collections import defaultdict


class DiagramOrdering:
    ZERO = "0"
    ONE = "1"
    NODES = "nodes"
    ID = "id"
    """
    A class used to represent the ordering priority of a diagram.

    ...

    Attributes
    ----------
    diagram : dict
        a dictionary representing the diagram
    parent_nodes : dict
        a dictionary representing the parent nodes

    Methods
    -------
    handle_no_edges(nodeOrder, childNodeList, orderCheck):
        Handles the case where there are no edges in the nodeOrder.
    fix_order_based_on_nodes(childNodeList, nodeOrder):
        Fixes the order of nodes based on available nodes within the parent node itself.
    manual_organization(childNodeList, orderCheck):
        Organizes the nodes manually.
    orderingPrio(parentnode):
        Orders the nodes based on priority.
    """

    def __init__(self, diagram, parent_nodes):
        """
        Constructs all the necessary attributes for the DiagramOrdering object.

        Parameters
        ----------
            diagram : dict
                a dictionary representing the diagram
            parent_nodes : dict
                a dictionary representing the parent nodes
        """
        self.diagram = diagram
        self.parent_nodes = parent_nodes

    def handle_no_edges(self, nodeOrder, childNodeList, orderCheck):
        """
        Handles the case where there are no edges in the nodeOrder.

        Parameters
        ----------
            nodeOrder : dict
                a dictionary representing the node order
            childNodeList : list
                a list of child nodes
            orderCheck : list
                a list of nodes to check

        Returns
        -------
        dict
            The updated nodeOrder.
        list
            The updated orderCheck.
        """
        if self.ONE in nodeOrder:
            del nodeOrder[self.ONE]
        for childnode in childNodeList:
            nodeOrder[self.ZERO].append(childnode)
            orderCheck.append(childnode)
        return nodeOrder, orderCheck

    def fix_order_based_on_nodes(self, childNodeList, nodeOrder):
        """
        Fixes the order of nodes based on available nodes within the parent node itself.

        Parameters
        ----------
            childNodeList : list
                a list of child nodes
            nodeOrder : dict
                a dictionary representing the node order

        Returns
        -------
        dict
            The updated nodeOrder.
        """
        nodes = self.diagram.get(self.NODES)
        if nodes is None:
            return nodeOrder

        for node in nodes:
            node_id = node.get(self.ID)
            if node_id not in childNodeList:
                self.remove_node_from_order(node_id, nodeOrder)
        return nodeOrder

    def remove_node_from_order(self, node_id, nodeOrder):
        """
        Removes a node from the order based on its ID.

        Parameters
        ----------
            node_id : str
                The ID of the node to remove.
            nodeOrder : dict
                The current node order.

        Returns
        -------
        dict
            The updated node order.
        """
        for _pnode, children in self.parent_nodes.items():
            if node_id in children:
                nodeOrder = self.remove_node_from_order_list(node_id, nodeOrder)
        return nodeOrder

    def remove_node_from_order_list(self, node_id, nodeOrder):
        """
        Removes a node from the order list based on its ID.

        Parameters
        ----------
            node_id : str
                The ID of the node to remove.
            nodeOrder : dict
                The current node order.

        Returns
        -------
        dict
            The updated node order.
        """
        for _order, nodes in nodeOrder.items():
            if isinstance(nodes, list) and node_id in nodes:
                nodes.remove(node_id)
        return nodeOrder

    def manual_organization(self, childNodeList, orderCheck):
        """
        Organizes the nodes manually.

        Parameters
        ----------
            childNodeList : list
                a list of child nodes
            orderCheck : list
                a list of nodes to check

        Returns
        -------
        list
            The list of manually organized parent nodes.
        list
            The list of manually organized child nodes.
        list
            The updated orderCheck.
        """
        if childNodeList is None or orderCheck is None:
            return [], [], orderCheck

        manualParent = []
        manualChild = []

        for child in childNodeList:
            if child not in orderCheck:
                if child in self.parent_nodes:
                    manualParent.append(child)
                else:
                    manualChild.append(child)
                orderCheck.append(child)

        return manualParent, manualChild, orderCheck

    def redundancyRemoval(self, nodeOrder, nodeOrderList):
        """
        Removes redundant entries from the node order dictionary and list.

        This function finds the orders in the node order list that have no corresponding entries in the node order dictionary. It then removes these orders and shifts the remaining orders down. The updated node order dictionary and list are returned.

        Args:
            nodeOrder (dict): A dictionary mapping order numbers to a list of node IDs.
            nodeOrderList (list): A list of the keys in the node order dictionary.

        Returns:
            tuple: A tuple containing the updated node order dictionary and list.
        """
        emptyCheck = [order for order in nodeOrderList if not nodeOrder[order]]

        for empty in reversed(emptyCheck):
            for i in range(int(empty), len(nodeOrderList) - 1):
                nodeOrder[str(i)] = nodeOrder[str(i + 1)]
            del nodeOrder[str(len(nodeOrderList) - 1)]
            nodeOrderList.pop()

        return nodeOrder, nodeOrderList

    def get_new_index(self, nodeOrder, node):
        """
        Gets the new index for the given node in the node order.

        This function iterates over the node order, checking if the given node is in the list of nodes for each order. If so, it returns the order as an integer. If the node is not found, it returns 0.

        Args:
            nodeOrder (dict): A dictionary mapping order numbers to a list of node IDs.
            node (str): The ID of the node.

        Returns:
            int: The new index for the node.
        """
        for order in nodeOrder:
            if node in nodeOrder[order]:
                return int(order)
        return 0

    def reorder(self, nodeOrder):
        """
        Reorders the given node order dictionary.

        This function finds the minimum and maximum order in the node order dictionary, then creates a new dictionary with the orders starting from 0. The keys of the new dictionary are returned as a list.

        Args:
            nodeOrder (dict): A dictionary mapping order numbers to a list of node IDs.

        Returns:
            list: A list of the keys in the new node order dictionary.
        """
        min_order = int(min(nodeOrder.keys(), key=int))
        max_order = int(max(nodeOrder.keys(), key=int))

        new_nodeOrder = {
            str(i - min_order): nodeOrder[str(i)]
            for i in range(min_order, max_order + 1)
        }

        return list(new_nodeOrder.keys())

    def edgeOrder(self, diagram, parentnode, parent_nodes):
        """
        Orders the edges in the given diagram based on their source and target nodes.

        This function iterates over the edges in the diagram, checking if the source or target node is in the parent nodes of the given parent node. If so, it determines the order of the nodes and updates the node order and order check lists accordingly.

        Args:
            diagram (dict): The diagram data. It should contain an "edges" key with a list of edge data. Each edge data should be a dictionary containing at least "source" and "target" keys.
            parentnode (str): The ID of the parent node.
            parent_nodes (dict): A dictionary mapping parent node IDs to a list of their child node IDs.

        Returns:
            tuple: A tuple containing two items. The first item is a dictionary mapping order numbers to a list of node IDs. The second item is a list of node IDs in the order they were checked.
        """
        nodeOrder = defaultdict(list)
        orderCheck = []

        for edge in diagram.get("edges"):
            source, target = edge.get("source"), edge.get("target")
            if source in parent_nodes[parentnode] or target in parent_nodes[parentnode]:
                if source in orderCheck and target not in orderCheck:
                    new_index = self.get_new_index(nodeOrder, source) + 1
                    nodeOrder[str(new_index)].append(target)
                    orderCheck.append(target)

                if target in orderCheck and source not in orderCheck:
                    new_index = self.get_new_index(nodeOrder, target) - 1
                    nodeOrder[str(new_index)].append(source)
                    orderCheck.append(source)

                if source not in orderCheck:
                    new_index = (
                        self.get_new_index(nodeOrder, target) - 1
                        if target in orderCheck
                        else list(nodeOrder.keys())[0]
                    )
                    nodeOrder[str(new_index)].append(source)
                    orderCheck.append(source)

                if target not in orderCheck:
                    new_index = (
                        self.get_new_index(nodeOrder, source) + 1
                        if source in orderCheck
                        else list(nodeOrder.keys())[-1]
                    )
                    nodeOrder[str(new_index)].append(target)
                    orderCheck.append(target)

        return nodeOrder, orderCheck

    def orderingPrio(self, parentnode):
        """
        Orders the nodes based on priority.

        Parameters
        ----------
            parentnode : str
                the parent node

        Returns
        -------
        dict
            The ordered nodes.
        list
            The list of node order keys.
        """
        childNodeList = self.parent_nodes[parentnode]

        nodeOrder, orderCheck = self.edgeOrder(
            self.diagram, parentnode, self.parent_nodes
        )
        nodeOrderList = self.reorder(nodeOrder)

        # Nodes with no edges at all
        edge_count = sum(
            [len(arr) if isinstance(arr, list) else 0 for arr in nodeOrder.values()]
        )
        if edge_count == 0:
            nodeOrder, orderCheck = self.handle_no_edges(
                nodeOrder, childNodeList, orderCheck
            )
            nodeOrderList.append("0")

        nodeOrder = self.fix_order_based_on_nodes(childNodeList, nodeOrder)

        nodeOrderList = list(nodeOrder.keys())

        # Pruning of nodeOrder
        if len(nodeOrderList) > 1:
            self.redundancyRemoval(nodeOrder, nodeOrderList)

        # Manual organization
        # manualParent, manualChild, orderCheck = self.manual_organization(
        #     childNodeList, orderCheck
        # )

        return nodeOrder, nodeOrderList
