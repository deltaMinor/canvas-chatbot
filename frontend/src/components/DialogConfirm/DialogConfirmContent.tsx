import React from "react";

import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";

import DialogConfirmMainContent from "./DialogConfirmMainContent";
import DialogConfirmPrimaryActions from "./DialogConfirmPrimaryActions";
import DialogConfirmSecondaryContent from "./DialogConfirmSecondaryContent";

interface DialogConfirmContentProps {
    handleCloseDialog: () => void;
    prop: ConfirmDialogProps;
}

const DialogConfirmContent = ({ handleCloseDialog, prop }: DialogConfirmContentProps) => {
    const [showSecondaryNo, setShowSecondaryNo] = React.useState<boolean>(false);
    const [showSecondaryYes, setShowSecondaryYes] = React.useState<boolean>(false);

    return (
        <>
            <DialogConfirmMainContent prop={prop} />
            <DialogConfirmPrimaryActions
                handleCloseDialog={handleCloseDialog}
                prop={prop}
                setShowSecondaryNo={setShowSecondaryNo}
                setShowSecondaryYes={setShowSecondaryYes}
                showSecondaryNo={showSecondaryNo}
                showSecondaryYes={showSecondaryYes}
            />
            {!!prop?.secondaryConfirmNo && !!showSecondaryNo && (
                <DialogConfirmSecondaryContent
                    confirmProps={prop.secondaryConfirmNo}
                    handleCancel={() => {
                        setShowSecondaryNo(false);
                    }}
                    handleConfirm={() => {
                        if (!!prop.onClickNo) {
                            prop.onClickNo();
                        }
                        handleCloseDialog();
                    }}
                />
            )}
            {!!prop?.secondaryConfirmYes && !!showSecondaryYes && (
                <DialogConfirmSecondaryContent
                    className="pb-0"
                    confirmProps={prop.secondaryConfirmYes}
                    handleCancel={() => {
                        setShowSecondaryYes(false);
                    }}
                    handleConfirm={() => {
                        if (!!prop.onClick) {
                            prop.onClick();
                        }
                        handleCloseDialog();
                    }}
                />
            )}
        </>
    );
};

export default React.memo(DialogConfirmContent);
