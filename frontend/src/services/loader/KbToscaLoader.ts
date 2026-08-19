import { KBTosca } from "#root/interfaces/tosca";
import app_store, { app_actions } from "#root/redux/store";
import { KbToscaAuthorization } from "#root/services/authorization/KbToscaAuthorization";
import { getKbToscaFromApi } from "#root/services/domain/tosca";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import { getKbToscaFromStore, getKbToscaLoadedFromStore } from "#root/stores/backendStore";

/**
 * Loads TOSCA mapping data into Redux.
 */
export class KbToscaLoader extends BaseLoader {
    constructor() {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new KbToscaAuthorization().isAuthorized;
    }

    override async init(): Promise<KBTosca | void> {
        const kbTosca = getKbToscaFromStore();
        const kbToscaLoaded = getKbToscaLoadedFromStore();

        if (kbToscaLoaded) {
            return kbTosca ?? undefined;
        }

        return await this.refresh();
    }

    override async get(): Promise<KBTosca | void> {
        const isAuthorized = this.syncAuthorization();
        app_store.dispatch(app_actions.backend.setKbToscaLoaded(false));
        app_store.dispatch(app_actions.backend.setKbToscaLoadError(false));

        if (!isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setKbTosca(null));
            app_store.dispatch(app_actions.backend.setKbToscaLoaded(true));
            return;
        }

        return await getKbToscaFromApi({})
            .then((kb_tosca) => {
                if (!kb_tosca) {
                    app_store.dispatch(app_actions.backend.setKbTosca(null));
                    app_store.dispatch(app_actions.backend.setKbToscaLoaded(true));
                    return;
                }

                app_store.dispatch(app_actions.backend.setKbTosca(kb_tosca));
                app_store.dispatch(app_actions.backend.setKbToscaLoaded(true));
                return kb_tosca;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setKbToscaLoadError(true));
                app_store.dispatch(app_actions.backend.setKbToscaLoaded(true));
            });
    }

    override async refresh(): Promise<KBTosca | void> {
        return await this.get();
    }
}
