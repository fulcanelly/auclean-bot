

export type requires_session = { session: string }
export type needs_target = { identifier: string }
export type Type<T> = { type: T }


export type job_requests
	= Type<'full_scan'> & needs_target & { is_regular?: boolean }
	| Type<'remove_job'>
	| Type<'test_load'>
	| Type<'recent_scan'> & needs_target & { days: number }


export type py_chanscan_request
	= requires_session
	& { log_id?: string; }
	& job_requests


