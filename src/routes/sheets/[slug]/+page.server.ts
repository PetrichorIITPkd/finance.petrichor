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

        let i = 0
        let len = verified.length;
        let result_promises = []
        let at_a_time = 3


        while (i < len) {
            let to_send = []
            let max_val = Math.min(i + at_a_time, len)
            for (let j = i; j < max_val; j++) {
                to_send.push(verified[j])
            }
            result_promises.push(
                POST(`${backend_url}internal/verifyTR/`, {
                    transaction_ids: to_send,
                    password: process.env.backend_pass,
                })
                    .then((res) => res.json())
                    .then(async (result) => {
                        // console.log(result)
                        return result
                    })
                    .catch((err) => {
                        console.log("err", err);
                        return {status: 400, "message": err.toString()}
                    }));
            i += at_a_time
        }
        return await Promise.all(result_promises).then(results => {
            let i = 0;
            let failed_transactions: string[] = []
            for (const res of results) {
                if (res.status == 200) {
                    failed_transactions = [...failed_transactions, ...res.failed_transactions]
                } else {
                    console.log("unsuccessful: ", res, i)
                    let max_val = Math.min(i + at_a_time, len)
                    for (let j = i; j < max_val; j++) {
                        failed_transactions.push(`${verified[j]}: failed response- ${res.toString()}`)
                    }
                }
                i+= at_a_time
            }
            return {"success": true, "failed_transactions" : failed_transactions}
        }).catch(err => {
            console.log(err.toString())
            return fail(400, {message: `Error: ${err.toString()}`})
        })

    },
    unverify: async ({ request }) => {
        const formData = await request.formData()
        let deleted = JSON.parse(formData.get('deleted'))
        // return
        let i = 0
        let len = deleted.length;
        let result_promises = []
        let at_a_time = 3

        while (i < len) {
            let to_send = []
            let max_val = Math.min(i + at_a_time, len)
            for (let j = i; j < max_val; j++) {
                to_send.push(deleted[j])
            }
            result_promises.push(
                POST(`${backend_url}internal/unverifyTR/`, {
                    transaction_ids: to_send,
                    password: process.env.backend_pass,
                })
                    .then((res) => res.json())
                    .then(async (result) => {
                        // console.log(result)
                        return result
                    })
                    .catch((err) => {
                        console.log("err", err);
                        return {status: 400, "message": err.toString()}
                    }));
            i += at_a_time
        }
        return await Promise.all(result_promises).then(results => {
            let i = 0;
            let failed_transactions: string[] = []
            for (const res of results) {
                if (res.status == 200) {
                    failed_transactions = [...failed_transactions, ...res.failed_transactions]
                } else {
                    console.log("unsuccessful: ", res, i)
                    let max_val = Math.min(i + at_a_time, len)
                    for (let j = i; j < max_val; j++) {
                        failed_transactions.push(`${deleted[j]}: failed response- ${res.toString()}`)
                    }
                }
                i+= at_a_time
            }
            return {"success": true, "failed_transactions" : failed_transactions}
        }).catch(err => {
            console.log(err.toString())
            return fail(400, {message: `Error: ${err.toString()}`})
        })
    }
} satisfies Actions;
