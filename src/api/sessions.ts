import { currentUser, getAccessToken, subscribeAuth } from './auth';
import { apiJson, apiVoid, getWebSocketBaseUrl } from './client';

export type WorkingSession = {
  plate: string;
  working: boolean;
  rest1: boolean;
  rest2: boolean;
  destination: boolean;
  passRest1: boolean;
  passRest2: boolean;
  passDestination: boolean;
};

export type CheckpointField =
  | 'rest1'
  | 'rest2'
  | 'destination'
  | 'passRest1'
  | 'passRest2'
  | 'passDestination';

export type Unsubscribe = () => void;

type WorkingSessionResponse = {
  plate: string;
  working: boolean;
  rest1: boolean;
  rest2: boolean;
  destination: boolean;
  pass_rest1: boolean;
  pass_rest2: boolean;
  pass_destination: boolean;
};

type WorkingSessionEnvelopeResponse = {
  session: WorkingSessionResponse | null;
};

type SessionEvent = {
  type: string;
  field: keyof WorkingSession | string;
  value: boolean | string | null;
};

type SessionListener = (value: string | boolean | null) => void;

const SESSION_FIELDS = [
  'plate',
  'working',
  'rest1',
  'rest2',
  'destination',
  'passRest1',
  'passRest2',
  'passDestination',
] as const satisfies ReadonlyArray<keyof WorkingSession>;

const listeners: Record<keyof WorkingSession, Set<SessionListener>> = {
  plate: new Set<SessionListener>(),
  working: new Set<SessionListener>(),
  rest1: new Set<SessionListener>(),
  rest2: new Set<SessionListener>(),
  destination: new Set<SessionListener>(),
  passRest1: new Set<SessionListener>(),
  passRest2: new Set<SessionListener>(),
  passDestination: new Set<SessionListener>(),
};

let currentSession: WorkingSession | null | undefined;
let snapshotPromise: Promise<void> | null = null;
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let keepSocketAlive = false;

function emptyWorkingSession(): WorkingSession {
  return {
    plate: '',
    working: false,
    rest1: false,
    rest2: false,
    destination: false,
    passRest1: false,
    passRest2: false,
    passDestination: false,
  };
}

function mapWorkingSession(data: WorkingSessionResponse): WorkingSession {
  return {
    plate: data.plate,
    working: data.working,
    rest1: data.rest1,
    rest2: data.rest2,
    destination: data.destination,
    passRest1: data.pass_rest1,
    passRest2: data.pass_rest2,
    passDestination: data.pass_destination,
  };
}

function hasListeners(): boolean {
  return SESSION_FIELDS.some((field) => listeners[field].size > 0);
}

function getFieldValue<F extends keyof WorkingSession>(field: F): WorkingSession[F] | null {
  if (currentSession === null || currentSession === undefined) {
    return null;
  }
  return currentSession[field];
}

function emitField<F extends keyof WorkingSession>(field: F): void {
  const value = getFieldValue(field);
  for (const listener of listeners[field]) {
    listener(value);
  }
}

function emitAllFields(): void {
  for (const field of SESSION_FIELDS) {
    emitField(field);
  }
}

function setCurrentSession(session: WorkingSession | null): void {
  currentSession = session;
  emitAllFields();
}

async function loadCurrentSession(): Promise<void> {
  const response = await apiJson<WorkingSessionEnvelopeResponse>('/sessions/me');
  setCurrentSession(response.session ? mapWorkingSession(response.session) : null);
}

function ensureCurrentSession(): Promise<void> {
  if (currentSession !== undefined) {
    return Promise.resolve();
  }

  if (snapshotPromise) {
    return snapshotPromise;
  }

  snapshotPromise = loadCurrentSession()
    .catch((error) => {
      console.error('[sessions] failed to load current session', error);
      setCurrentSession(null);
    })
    .finally(() => {
      snapshotPromise = null;
    });

  return snapshotPromise;
}

function clearReconnectTimer(): void {
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function closeSocket(): void {
  keepSocketAlive = false;
  clearReconnectTimer();
  if (socket) {
    socket.onopen = null;
    socket.onclose = null;
    socket.onerror = null;
    socket.onmessage = null;
    socket.close();
    socket = null;
  }
}

function resetRealtimeState(): void {
  closeSocket();
  currentSession = undefined;
}

function scheduleReconnect(): void {
  if (reconnectTimer !== null || !keepSocketAlive || !hasListeners() || !getAccessToken()) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void ensureSocket();
  }, 1000);
}

function applyFieldEvent(field: keyof WorkingSession, value: string | boolean | null): void {
  if (field === 'working' && value === false) {
    setCurrentSession(null);
    return;
  }

  const next = currentSession ?? emptyWorkingSession();

  if (field === 'plate') {
    next.plate = typeof value === 'string' ? value : '';
  } else {
    next[field] = Boolean(value) as WorkingSession[typeof field];
  }

  currentSession = next;
  emitField(field);
}

function handleSocketMessage(event: MessageEvent<string>): void {
  try {
    const data = JSON.parse(event.data) as SessionEvent;
    if (!SESSION_FIELDS.includes(data.field as keyof WorkingSession)) {
      return;
    }
    applyFieldEvent(data.field as keyof WorkingSession, data.value);
  } catch (error) {
    console.error('[sessions] failed to process websocket payload', error);
  }
}

async function ensureSocket(): Promise<void> {
  const token = getAccessToken();
  if (!token || socket || !hasListeners()) {
    return;
  }

  keepSocketAlive = true;
  const nextSocket = new WebSocket(
    `${getWebSocketBaseUrl()}/ws?token=${encodeURIComponent(token)}`,
  );

  socket = nextSocket;
  nextSocket.onmessage = handleSocketMessage;
  nextSocket.onerror = () => {
    nextSocket.close();
  };
  nextSocket.onclose = () => {
    if (socket === nextSocket) {
      socket = null;
    }
    if (keepSocketAlive) {
      scheduleReconnect();
    }
  };
}

subscribeAuth(() => {
  if (!currentUser.value) {
    resetRealtimeState();
  } else {
    currentSession = undefined;
  }
});

export function watchSessionField<F extends keyof WorkingSession>(
  uid: string,
  field: F,
  onChange: (value: WorkingSession[F] | null) => void,
): Unsubscribe {
  void uid;

  const listener: SessionListener = (value) => {
    onChange(value as WorkingSession[F] | null);
  };

  listeners[field].add(listener);

  if (currentSession !== undefined) {
    onChange(getFieldValue(field));
  } else {
    void ensureCurrentSession();
  }
  void ensureSocket();

  return () => {
    listeners[field].delete(listener);
    if (!hasListeners()) {
      closeSocket();
    }
  };
}

export async function startSession(uid: string, plate: string): Promise<void> {
  void uid;
  const response = await apiJson<WorkingSessionResponse>('/sessions/start', {
    method: 'POST',
    body: { plate },
  });
  setCurrentSession(mapWorkingSession(response));
  void ensureSocket();
}

export async function markCheckpointReached(
  uid: string,
  field: CheckpointField,
): Promise<void> {
  void uid;
  const response = await apiJson<WorkingSessionResponse>(`/sessions/checkpoint/${field}`, {
    method: 'POST',
  });
  setCurrentSession(mapWorkingSession(response));
}

export async function endSession(uid: string): Promise<void> {
  void uid;
  await apiVoid('/sessions/end', { method: 'POST' });
  setCurrentSession(null);
}
