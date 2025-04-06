interface ErrorDetails {
    message?: string;
    cause?: unknown;
    stack?: string;
    name?: string;
    code?: number;
}

interface ErrorBody {
    colno: number;
    filename: string;
    lineno: number;
    message: string;
    type: string;
    rawError?: string
    error?: ErrorDetails;
}

interface RejectionReasonBody {
    type: string
    rawReason?: string
    error?: ErrorDetails;
}

function getErrorDetails(error: Error): ErrorDetails {
    return {cause: error.cause, stack: error.stack, name: error.name};
}

function getDomExceptionDetails(error: DOMException): ErrorDetails {
    return {message: error.message, name: error.name, code: error.code};
}

window.addEventListener("error", event => {
    const error = event.error;

    let rawError: string | undefined = undefined;
    try {
        rawError = JSON.stringify(error);
    } catch {}

    const {colno, filename, lineno, message} = event;
    const body: ErrorBody = {
        colno,
        filename,
        lineno,
        message,
        type: error?.constructor?.name ?? typeof error,
        rawError,
    };

    let errorDetails = undefined;
    if (error instanceof Error) {
        errorDetails = getErrorDetails(error)
    } else if (error instanceof DOMException) {
        errorDetails = getDomExceptionDetails(error);
    }

    body.error = errorDetails;

    fetch(
        "/api/report/error",
        {
            method: "POST",
            body: JSON.stringify(body),
            headers: {"Content-Type": "application/json"},
            keepalive: true,
        }
    );
});

window.addEventListener("unhandledrejection", event => {
    const reason = event.reason;

    let rawReason: string | undefined = undefined;
    try {
        rawReason = JSON.stringify(reason);
    } catch {}

    const body: RejectionReasonBody = {
        type: reason?.constructor?.name ?? typeof reason,
        rawReason,
    };

    let errorDetails = undefined;
    if (reason instanceof Error) {
        errorDetails = getErrorDetails(reason)
    } else if (reason instanceof DOMException) {
        errorDetails = getDomExceptionDetails(reason);
    }

    body.error = errorDetails;

    fetch(
        "/api/report/unhandled-rejection",
        {
            method: "POST",
            body: JSON.stringify(body),
            headers: {"Content-Type": "application/json"},
            keepalive: true,
        }
    );
})
