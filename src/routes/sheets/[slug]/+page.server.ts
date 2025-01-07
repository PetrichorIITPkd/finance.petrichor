// import { password, newP } from '$lib/index.server';
import type { Data, Vtransaction } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { backend_url, POST } from '$lib';

export const load: PageServerLoad = async ({ params }) => {
    if (params.slug != process.env.pass){
    // if (params.slug != "petrichor"){
        error(404, {message: 'Not Found'})
    }
	const res = await POST(`${backend_url}internal/sheets/view/`,{})
    const result = await res.json()
    const verified:Vtransaction[] = [];
    const unverified:Vtransaction[] = [];
    if (result.status == 200){
        const data :Data= result.data
        Object.entries(data).forEach(([eventId,transactions])=>{
            transactions.forEach((e)=>{
                if (e.payment.verified){
                    verified.push({
                        "event":eventId,...e.payment})
                }else {
                    unverified.push({
                        "event":eventId,...e.payment})
                }
            })
        })
    }
    return {data: result.data,"verified":verified,"unverified":unverified}
};
