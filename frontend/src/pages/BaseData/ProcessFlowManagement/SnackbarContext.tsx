import React, { createContext, useContext } from "react";

type SnackbarFn = (message: string, severity: "success" | "error") => void;

const SnackbarContext = createContext<{ showSnackbar: SnackbarFn } | null>(null);

export const SnackbarProvider = ({
                                     showSnackbar,
                                     children,
                                 }: {
    showSnackbar: SnackbarFn;
    children: React.ReactNode;
}) => (
    <SnackbarContext.Provider value={{ showSnackbar }}>
        {children}
    </SnackbarContext.Provider>
);

export const useSnackbarContext = () => {
    const ctx = useContext(SnackbarContext);
    if (!ctx) throw new Error("SnackbarProvider missing");
    return ctx;
};
