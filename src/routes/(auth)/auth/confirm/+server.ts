import type { EmailOtpType } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/';

	/**
	 * Clean up the redirect URL by deleting the Auth flow parameters.
	 */
	const redirectTo = new URL(url);
	redirectTo.pathname = next; // Default to `next`, which falls back to `/`
	redirectTo.searchParams.delete('token_hash');
	redirectTo.searchParams.delete('type');

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ type, token_hash });
		if (!error) {
			redirectTo.searchParams.delete('next');
			redirectTo.pathname = '/'; // Redirect to home page
			throw redirect(303, redirectTo.toString());
		}
	}

	redirectTo.pathname = '/auth/error'; // Handle error case
	throw redirect(303, redirectTo.toString());
};
