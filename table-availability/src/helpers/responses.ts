export function ok<T>(data: T): Response {
    return Response.json({ success: true, data, error: null });
}

export function fail(error: string, status: number = 400): Response {
    return Response.json({ success: false, data: null, error }, { status });
}