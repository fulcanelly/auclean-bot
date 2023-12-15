
export namespace spy {
	enum LogKind {
		FULL_SCAN,
		VIEW_UPDATE,
		FULL_RESCAN
	}

	export type Channel = {
		id: number;
		title: string;
		username: string;
		subs?: number;
		date: number;
		type: 'channel';
		// created_at?: number;
		// need_to_scan?: boolean;

		// uuid?: string;
		// channel_id?: string;
	};

	export type Post = {
		id: number;
		grouped_id: undefined | number;
		views: number;
		post_author: string;
		date: number;
		channel_id: number;
		type: 'post';
		fwd_from_channel?: {
			channel_post_id: number;
			channel_id: number;
			post_author: string;
			title?: string,
			username?: string,
			date: number;
		};
		fwd_from_user?: {
			date: number;
			user_id: number;
		};
	}

	export type ScanStart = {
		type: 'start_event'
	}

	export type ScanFinish = {
		type: 'finish_event'
	}

	export type Packet = (Post | Channel | ScanStart | ScanFinish) & { log_id: string }
}
