import { UserStoryCardRef } from "#root/interfaces/diagram";

export const getDeviceToInterfaceMappingFromCanvas = (card_ref?: UserStoryCardRef | null) => {
    if (!card_ref) return [];

    return (
        card_ref?.card_devices?.map((device) => {
            return {
                label: device.label,
                value: device.value,
                node_id: device.node_id,
                interfaces:
                    card_ref?.card_interface?.filter(
                        (interfaceNode) =>
                            device.card_id_affliations.filter(
                                (deviceAffliation: string) =>
                                    !!interfaceNode.card_id_affliations?.includes(deviceAffliation)
                            ).length !== 0
                    ) ?? [],
            };
        }) ?? []
    );
};
