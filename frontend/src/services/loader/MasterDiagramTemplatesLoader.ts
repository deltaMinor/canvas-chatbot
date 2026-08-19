import { MasterDiagramTemplate } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import { MasterDiagramTemplatesAuthorization } from "#root/services/authorization/MasterDiagramTemplatesAuthorization";
import { getMasterDiagramTemplatesFromApi } from "#root/services/domain/diagram_template";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import { getBackendStateFromStore } from "#root/stores/backendStore";

export class MasterDiagramTemplatesLoader extends BaseLoader {
    constructor() {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new MasterDiagramTemplatesAuthorization().isAuthorized;
    }

    override async init(): Promise<MasterDiagramTemplate[] | void> {
        const { masterDiagramTemplates, masterDiagramTemplatesLoaded } = getBackendStateFromStore();

        if (masterDiagramTemplatesLoaded) {
            return masterDiagramTemplates;
        }

        return await this.refresh();
    }

    override async get(): Promise<MasterDiagramTemplate[] | void> {
        const isAuthorized = this.syncAuthorization();
        app_store.dispatch(app_actions.backend.setMasterDiagramTemplatesLoaded(false));
        app_store.dispatch(app_actions.backend.setMasterDiagramTemplatesLoadError(false));

        if (!isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setMasterDiagramTemplates([]));
            app_store.dispatch(app_actions.backend.setMasterDiagramTemplatesLoaded(true));
            return;
        }

        return await getMasterDiagramTemplatesFromApi({})
            .then((masterDiagramTemplates) => {
                if (!masterDiagramTemplates) {
                    app_store.dispatch(app_actions.backend.setMasterDiagramTemplates([]));
                    app_store.dispatch(app_actions.backend.setMasterDiagramTemplatesLoaded(true));
                    return;
                }

                app_store.dispatch(
                    app_actions.backend.setMasterDiagramTemplates(masterDiagramTemplates)
                );
                app_store.dispatch(app_actions.backend.setMasterDiagramTemplatesLoaded(true));
                return masterDiagramTemplates;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setMasterDiagramTemplatesLoadError(true));
                app_store.dispatch(app_actions.backend.setMasterDiagramTemplatesLoaded(true));
            });
    }

    override async refresh(): Promise<MasterDiagramTemplate[] | void> {
        return await this.get();
    }
}
