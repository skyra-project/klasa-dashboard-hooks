declare module 'klasa-dashboard-hooks' {

	import { Collection, Guild, Permissions, User } from 'discord.js';
	import { IncomingMessage, Server as HttpServer, ServerOptions as H1ServerOptions, ServerResponse } from 'http';
	import { Http2SecureServer, SecureServerOptions as H2SecureServerOptions } from 'http2';
	import { ServerOptions as HS1ServerOptions } from 'https';
	import { KlasaClient, KlasaClientOptions, Piece, PieceDefaults, PieceOptions, Store } from 'klasa';
	import { Server as HttpSecureServer } from 'tls';

//#region Classes

	export class DashboardClient extends KlasaClient {
		public constructor(options?: DashboardClientOptions);
		public options: Required<DashboardClientOptions>;
		public server: Server;
		public routes: RouteStore;
		public middlewares: MiddlewareStore;
		public dashboardUsers: Collection<string, DashboardUser>;
	}

	export { DashboardClient as Client };

	export class DashboardUser {
		public constructor(client: DashboardClient, user: any);
		public client: DashboardClient;
		public id: string;
		public username: string;
		public discriminator: number;
		public locale: string;
		public mfaEnabled: boolean;
		public avatar: string;
		public guilds: Collection<string, DashboardGuild>;
		public avatarURL: string;
		public user: User | null;
		public toJSON(): any;
		private setupGuilds(dashboardUser: DashboardUser, guilds: any[]): void;
	}

	export class DashboardGuild {
		public constructor(client: DashboardClient, guild: any, user: DashboardUser);
		public client: DashboardClient;
		public user: DashboardUser;
		public id: string;
		public name: string;
		public icon: string | null;
		public userIsOwner: boolean;
		public userGuildPermissions: Permissions;
		public userCanManage: boolean;
		public iconURL: string | null;
		public guild: Guild;
		public toJSON(): any;
	}

	export class Server {
		public constructor(client: DashboardClient);
		public client: DashboardClient;
		public server: HttpServer | HttpSecureServer | Http2SecureServer;
		public onNoMatch: (request: IncomingMessage, response: ServerResponse) => void;
		public listen(port: number): Promise<void>;
		public handler(request: IncomingMessage, response: ServerResponse): Promise<void>;
		public onError(error: Error | ErrorLike, request: KlasaIncomingMessage, response: ServerResponse): void;
	}

	export abstract class Middleware extends Piece {
		public constructor(store: MiddlewareStore, file: string[], directory: string, options?: MiddlewareOptions);
		public priority: number;
		public abstract run(request: KlasaIncomingMessage, response: ServerResponse, route?: Route): unknown;
	}

	export class MiddlewareStore extends Store<string, Middleware, typeof Middleware> {
		public sortedMiddlewares: Middleware[];
		public run(request: KlasaIncomingMessage, response: ServerResponse, route?: Route): Promise<unknown>;
	}

	export abstract class Route extends Piece {
		public constructor(store: RouteStore, file: string[], directory: string, options?: RouteOptions);
		public authenticated: boolean;
		public parsed: ParsedRoute;
		public route: string;
		public matches(split: string[]): boolean;
		public execute(split: string[]): Record<string, any>;
	}

	export class RouteStore extends Store<string, Route, typeof RouteStore> {
		public registry: Record<string, Map<string, Route>>;
		public findRoute(method: string, splitURL: string[]): Route | undefined;
	}

	export const constants: Constants;

	export class Util {
		public static parsePart(val: string): ParsedPart;
		public static split(url: string): string[];
		public static parse(url: string): ParsedPart[];
		public static encrypt(data: any, secret: string): string;
		public static decrypt(token: string, secret: string): any;
	}

//#endregion Classes
//#region Types

	export interface KlasaDashboardHooksOptions {
		apiPrefix?: string;
		origin?: string;
		port?: number;
		http2?: boolean;
		serverOptions?: H1ServerOptions | HS1ServerOptions | H2SecureServerOptions;
	}

	export interface DashboardClientOptions extends KlasaClientOptions {
		clientID?: string;
		clientSecret?: string;
		dashboardHooks?: KlasaDashboardHooksOptions;
	}

	export interface KlasaIncomingMessage extends IncomingMessage {
		originalUrl: string;
		path: string;
		search: string;
		query: Record<string, string | string[]>;
		params: Record<string, any>;
		body?: any;
		length?: number;
		auth?: AuthData;
	}

	export interface RouteOptions extends PieceOptions {
		route?: string;
		authenticated?: boolean;
	}

	export interface MiddlewareOptions extends PieceOptions {
		priority?: number;
	}

	export interface ErrorLike {
		code?: number;
		status?: number;
		statusCode?: number;
		message?: string;
	}

	export interface ParsedPart {
		val: string;
		type: number;
	}

	export type ParsedRoute = ParsedPart[];

	export interface Constants {
		OPTIONS: {
			dashboardHooks: Required<KlasaDashboardHooksOptions>;
			pieceDefaults: {
				[K in keyof PieceDefaults]?: Required<PieceDefaults[K]>;
			};
		};
		METHODS_LOWER: string[];
		RESPONSES: {
			FETCHING_TOKEN: string;
			NO_CODE: string;
			UNAUTHORIZED: string;
			NOT_READY: string;
			OK: string;
			UPDATED: [string, string];
		};
	}

	export interface AuthData {
		token: string;
		scope: string[];
	}

//#endregion Types

}

declare module 'klasa' {

	import { MiddlewareOptions, RouteOptions } from 'klasa-dashboard-hooks';

	interface PieceDefaults {
		routes?: RouteOptions;
		middlewares?: MiddlewareOptions;
	}

}

declare module 'discord.js' {

	import { DashboardUser, KlasaDashboardHooksOptions, MiddlewareStore, RouteStore, Server } from 'klasa-dashboard-hooks';

	interface Client {
		server: Server;
		routes: RouteStore;
		middlewares: MiddlewareStore;
		dashboardUsers: Collection<string, DashboardUser>;
	}

	interface ClientOptions {
		clientID?: string;
		clientSecret?: string;
		dashboardHooks?: KlasaDashboardHooksOptions;
	}

}
