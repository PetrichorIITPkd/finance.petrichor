// import { password, newP } from '$lib/index.server';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { API, POST } from '$lib';

export const load: PageServerLoad = async ({ params }) => {
	if (params.slug != process.env.pass){
        throw error(404, {message: 'Wrong Password'})
    }
	const res = await POST(API.allEvents,{
        "password":process.env.pass
    })
    const result = await res.json()
    if (result.status != 200){
        throw error(404, {message: 'Unable to resolve the response. ' + result.message})
    }
    return {data: result.data, "pass": params.slug}
};
