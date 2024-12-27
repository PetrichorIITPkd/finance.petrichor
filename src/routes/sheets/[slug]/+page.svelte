<script lang="ts">
    import Loading from "$lib/components/Loading.svelte";
    import PopUpBox from "$lib/components/PopUpBox.svelte";
    import { backend_url, POST, reloadData } from "$lib/index";
    import { PopUp } from "$lib/PopUp";
    import type { Data, member, transaction, Vtransaction } from "$lib/types";
    import { onMount } from "svelte";
    export let data: any;

    let eventData: Data = data.data;
    let eventList: string[] = Object.keys(eventData);
    let verifiedPayments: Vtransaction[] = data.verified;
    let unverifiedPayments: Vtransaction[] = data.unverified;
    let verified: string[] = [];
    let consol = "";
    let loading = true;
    onMount(() => {
        loading = false;
    });
    let state = "Unverified";
    let PopUpObj = new PopUp([], false);
    function handleChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        state = target.value;
        console.log(state);
    }
    const displayPopUp = (members: member[]) => {
        PopUpObj.members = members;
        PopUpObj.isOn = true;
        return;
    };
</script>


<!-- <textarea value={consol}></textarea> -->

<!-- <div class="gradient-bg">
    <div class="gradients-container extra">
        <div id="g1-3_1" class="g" />
        <div id="g1-2_1" class="g" />
        <div id="g1-1_1" class="g" />
        <div id="g1-7_1" class="g" />
    </div>
</div> -->

<div class="main">
    {#if verified.length > 0}
        <button
            class="submit"
            on:click={() => {
                consol = "";
                if (
                    !confirm(
                        "Do you really really want to submit. This is irreversible.\nParticipants will get an email regarding their verification in the events immediately",
                    )
                ) {
                    return;
                }
                loading = true;
    
                // verified.forEach(async (v) => {
                POST(`${backend_url}internal/verifyTR/`, {
                    transaction_ids: verified,
                })
                    .then((res) => res.json())
                    .then(async (result) => {
                        if (result.status == 200) {
                            //result.succes
                            alert(`Transaction Ids verified and mail has been sent. \n\
                            Total requests sent : ${verified.length}\n\
                            requests : ${verified}\n\
                            No of trasactions, server failed to verify = ${result.failed_transactions.length};\n\
                            Those transactions are: ${result.failed_transactions}`);
                            //!result.success => failed trs[]
                            const res = await reloadData();
                            verifiedPayments = res.verified;
                            unverifiedPayments = res.unverified;
                            eventData = res.data;
                            console.log(eventData);
                            // consol += `${v} verified\n`;
                        } else if (result.status == 404) {
                            // consol += `${v} failed\n`;
                        }
                        loading = false;
                        // console.log(result);
                    })
                    .catch((err) => {
                        loading = false;
                        console.log(err);
                    });
                // });
            }}>Submit</button
        >
    {/if}
    <select on:change={handleChange}>
        <option value="Unverified">Unverified</option>
        <option value="Verified">Verified</option>
        {#each eventList as e}
            <option value={e}>{e}</option>
        {/each}
    </select>

    <h1>{state}</h1>
    <div class="tb">
        {#if state == "Verified"}
            <table>
                <tr>
                    <th>Event</th>
                    <th>Name</th>
                    <th>CACode</th>
                    <th>Transaction ID</th>
                    <th>No. of Participants</th>
                    <th>Total Amount</th>
                </tr>
                {#each verifiedPayments as payment}
                    <tr>
                        <td>{payment.event}</td>
                        <td>{payment.name}</td>
                        <td>{payment.CA}</td>
                        <td>{payment.transId}</td>
                        <td>{payment.parts}</td>
                        <td>{payment.amount}</td>
                    </tr>
                {/each}
            </table>
        {:else if state == "Unverified"}
            <table>
                <tr>
                    <th>Event</th>
                    <th>Name</th>
                    <th>CACode</th>
                    <th>Transaction ID</th>
                    <th>No. of Participants</th>
                    <th>Total Amount</th>
                    <th>Verified</th>
                </tr>
                {#each unverifiedPayments as payment}
                    <tr>
                        <td>{payment.event}</td>
                        <td>{payment.name}</td>
                        <td>{payment.CA}</td>
                        <td>{payment.transId}</td>
                        <td>{payment.parts}</td>
                        <td>{payment.amount}</td>

                        <td
                            ><input
                                type="checkbox"
                                on:change={(e) => {
                                    // @ts-ignore
                                    if (e?.target?.checked) {
                                        verified.push(payment.transId);
                                        verified = verified;
                                    } else {
                                        verified = verified.filter(
                                            (v) => v != payment.transId,
                                        );
                                    }
                                }}
                            /></td
                        >
                    </tr>
                {/each}
            </table>
        {:else}
            <table>
                <tr>
                    <th>Name</th>
                    <th>CACode</th>
                    <th>Transaction ID</th>
                    <th>No. of Participants</th>
                    <th>Total Amount</th>
                    <th>Verified</th>
                    <th>Team</th>
                </tr>
                {#each eventData[state] as d}
                    <tr>
                        <td>{d.payment.name}</td>
                        <td>{d.payment.CA}</td>
                        <td>{d.payment.transId}</td>
                        <td>{d.payment.parts}</td>
                        <td>{d.payment.amount}</td>
                        {#if d.payment.verified}
                            <td><input type="checkbox" checked disabled /></td>
                        {:else}
                            <td
                                ><input
                                    type="checkbox"
                                    on:change={(e) => {
                                        // @ts-ignore
                                        if (e?.target?.checked) {
                                            verified.push(d.payment.transId);
                                            verified = verified;
                                        } else {
                                            verified = verified.filter(
                                                (v) => v != d.payment.transId,
                                            );
                                        }
                                    }}
                                /></td
                            >
                        {/if}
                        <td
                            ><button on:click={() => displayPopUp(d["members"])}
                                >View</button
                            ></td
                        >
                    </tr>
                {/each}
            </table>
        {/if}
    </div>
</div>

<Loading spinning={loading} />

{#if PopUpObj.isOn}
    <PopUpBox bind:PopUpObj />
{/if}

<style>
    .main{
        z-index: 2;
        position: relative;
    }
    select{
        padding: 10px;
        background-color: rgba(191, 248, 248, 0.499);
    }
    .submit {
        position: fixed;
        right: 10vw;
        font-size: 50px;
    }
    table {
        border: 2px solid rgba(25, 25, 179, 0.562);
        background-color: rgba(29, 70, 120, 0.374);
    }

    th {
        padding: 30px;
        height: 100%;
        background-color: rgba(40, 97, 171, 0.684);
    }
    td {
        text-align: center;
        padding: 10px 20px;
        border-right: 2px rgba(104, 151, 187, 0.623) solid;
    }
    .tb {
        display: flex;
        z-index: 3;
        justify-content: center;
    }
    h1 {
        text-align: center;
    }
</style>
