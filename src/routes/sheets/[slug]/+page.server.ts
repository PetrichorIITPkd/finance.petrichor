// import { password, newP } from '$lib/index.server';
import type { Data, Vtransaction } from '$lib/types';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { backend_url, POST } from '$lib';

export const load: PageServerLoad = async ({ params }) => {
    if (params.slug != process.env.pass) {
        // if (params.slug != "petrichor"){
        error(404, { message: 'Not Found' })
    }
    const res = await POST(`${backend_url}internal/sheets/view/`, {})
    const result = await res.json()
    const verified: Vtransaction[] = [];
    const unverified: Vtransaction[] = [];
    if (result.status == 200) {
        const data: Data = result.data
        Object.entries(data).forEach(([eventId, transactions]) => {
            transactions.forEach((e) => {
                if (e.payment.verified) {
                    verified.push({
                        "event": eventId, ...e.payment
                    })
                } else {
                    unverified.push({
                        "event": eventId, ...e.payment
                    })
                }
            })
        })
    }
    return { data: result.data, "verified": verified, "unverified": unverified, pass: process.env.backend_pass }
};

export const actions = {
    verify: async ({ request }) => {
        const formData = await request.formData()
        let verified = JSON.parse(formData.get('verified'))

        return await POST(`${backend_url}internal/verifyTR/`, {
            transaction_ids: verified,
            password: process.env.backend_pass,
        })
            .then((res) => res.json())
            .then(async (result) => {
                // console.log(result)
                if (result.status == 200) {
                    //result.success
                    return result
                } else if (result.status == 404) {
                    return result
                }
            })
            .catch((err) => {
                console.log("err",err);
                return fail(404,{ status: 404, "message": err.toString() })
            });
    },
    unverify: async ({ request }) => {
        const formData = await request.formData()
        let deleted = JSON.parse(formData.get('deleted'))
        // return

        return await POST(`${backend_url}internal/unverifyTR/`, {
            transaction_ids: deleted,
            password: process.env.backend_pass,
        })
            .then((res) => res.json())
            .then(async (result) => {
                // console.log(result);
                if (result.status == 200) {
                    //result.succes
                    return result
                } else if (result.status == 404) {
                    // consol += `${v} failed\n`;
                    return result
                }
            })
            .catch((err) => {
                console.log("err",err);
                return fail(404,{ status: 404, "message": err.toString() })
            });
    }
} satisfies Actions;
