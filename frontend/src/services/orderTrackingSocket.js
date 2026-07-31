import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WEBSOCKET_URL =
    "http://localhost:8080/ws";

/**
 * Creates a STOMP client for FoodExpress
 * order-tracking events.
 *
 * The client connects through SockJS and subscribes
 * to one order-specific destination:
 *
 * /topic/orders/{orderId}
 */
export function createOrderTrackingClient({
    orderId,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
}) {
    if (orderId == null) {
        throw new Error(
            "Order id is required for WebSocket subscription."
        );
    }

    const client = new Client({
        webSocketFactory: () =>
            new SockJS(WEBSOCKET_URL),

        reconnectDelay: 5000,

        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        debug: (message) => {
            console.debug(
                "[OrderTrackingSocket]",
                message
            );
        },

        onConnect: () => {
            console.info(
                `[OrderTrackingSocket] Connected for order ${orderId}`
            );

            client.subscribe(
                `/topic/orders/${orderId}`,
                (frame) => {
                    try {
                        const message =
                            JSON.parse(frame.body);

                        console.info(
                            "[OrderTrackingSocket] Message received:",
                            message
                        );

                        onMessage?.(message);
                    } catch (error) {
                        console.error(
                            "[OrderTrackingSocket] Failed to parse message:",
                            error
                        );

                        onError?.(error);
                    }
                }
            );

            onConnect?.();
        },

        onStompError: (frame) => {
            const error = new Error(
                frame.headers?.message ||
                "STOMP broker error."
            );

            console.error(
                "[OrderTrackingSocket] STOMP error:",
                frame
            );

            onError?.(error);
        },

        onWebSocketError: (event) => {
            const error = new Error(
                "WebSocket connection failed."
            );

            console.error(
                "[OrderTrackingSocket] WebSocket error:",
                event
            );

            onError?.(error);
        },

        onWebSocketClose: () => {
            console.info(
                `[OrderTrackingSocket] Disconnected from order ${orderId}`
            );

            onDisconnect?.();
        },
    });

    return client;
}

/**
 * Starts the order-tracking connection.
 */
export function connectOrderTracking(
    options
) {
    const client =
        createOrderTrackingClient(options);

    client.activate();

    return client;
}

/**
 * Safely closes an existing STOMP connection.
 */
export async function disconnectOrderTracking(
    client
) {
    if (!client) {
        return;
    }

    try {
        await client.deactivate();

        console.info(
            "[OrderTrackingSocket] Connection closed."
        );
    } catch (error) {
        console.error(
            "[OrderTrackingSocket] Failed to disconnect:",
            error
        );
    }
}