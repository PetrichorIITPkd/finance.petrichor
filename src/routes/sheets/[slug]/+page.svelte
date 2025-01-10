<script lang="ts">
    import { enhance } from "$app/forms";
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
    let deleted: string[] = [];
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

    const handleunverifyres = (onsubmit: {
        [x: string]: any;
        cancel: () => void;
    }) => {
        if (
            !confirm(
                "Do you really really want to submit. This is irreversible.\nParticipants will get an email regarding this immediately",
            )
        ) {
            onsubmit.cancel();
            return;
        }
        onsubmit.formData.set("deleted", JSON.stringify(deleted));
        loading = true;
        return async ({ result }) => {
            loading = false;
            if (result.type == "success" && result.data) {
                const result_data = result.data;
                alert(`Transaction Ids unverified and mail has been sent. \n\
        Total requests sent : ${deleted.length}\n\
        requests : 
\t\t${deleted.join('\n\t\t')}\n\
        No of trasactions, server failed to unverify = ${result_data.failed_transactions.length};\n\
        Those transactions are: 
\t\t${result_data.failed_transactions.join('\n\t\t')}`);
                //!result_data.success => failed trs[]
                const res = await reloadData();
                verifiedPayments = res.verified;
                unverifiedPayments = res.unverified;
                eventData = res.data;
                window.location.reload()
                // consol += `${v} verified\n`;
            } else {
                console.log(result);
            }
            loading = false;
        };
    };

    const handleverifyres = (onsubmit: {
        [x: string]: any;
        cancel: () => void;
    }) => {
        if (
            !confirm(
                "Do you really really want to submit. This is irreversible.\nParticipants will get an email regarding their verification in the events immediately",
            )
        ) {
            onsubmit.cancel();
            return;
        }
        onsubmit.formData.set("verified", JSON.stringify(verified));
        loading = true;
        return async ({ result }) => {
            // console.log("result", result)
            loading = false;
            if (result.type == "success" && result.data) {
                const result_data = result.data;
                alert(`Transaction Ids verified and mail has been sent. \n\
        Total requests sent : ${verified.length}\n\
        requests : 
\t\t${verified.join('\n\t\t')}\n\
        No of trasactions, server failed to verify = ${result_data.failed_transactions.length};\n\
        Those transactions are:
\t\t${result_data.failed_transactions.join('\n\t\t')}`);
                //!result_data.success => failed trs[]
                const res = await reloadData();
                verifiedPayments = res.verified;
                unverifiedPayments = res.unverified;
                eventData = res.data;
                window.location.reload()
                // console.log(eventData);
                // consol += `${v} verified\n`;
            } else {
                console.log("stat",result);
            }
            console.log(result)
        };
    };

    // Function to download the dictionary as a JSON file
    function downloadCSV() {
        // Convert the dictionary to JSON string
        // const jsonString = JSON.stringify(myDict, null, 2);

        // Extract headers (keys) and values (rows) from the dictionary
        let headers = ""; // "name,age,city"
        if (["Unverified", "Verified"].includes(state)) {
            headers =
                "Event Name, user_name, email, amount expected, CACode, number of participants,verified";
        } else {
            headers =
                "user_name, email, amount expected, CACode, number of participants,verified,registered by, participants";
        }
        let data = [];
        if (state == "Verified") {
            data = verifiedPayments;
        } else if (state == "Unverified") {
            data = unverifiedPayments;
        } else {
            data = eventData[state];
        }

        const values = data.map((e) => {
            if (["Unverified", "Verified"].includes(state)) {
                return Object.values(e).join(",");
            } else {
                let final_row = Object.values(e.payment);
                for (const member of e.members) {
                    final_row.push(
                        `${member.name};${member.email};${member.phone}`,
                    );
                }
                return final_row.join(",");
            }
        });

        // Combine headers and values into CSV format
        const csvString = `${headers}\n${values.join("\n")}`;

        // Create a Blob with the JSON data
        const blob = new Blob([csvString], { type: "text/csv" });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a link element
        const a = document.createElement("a");
        a.href = url;
        a.download = `${state}.csv`;

        // Append to the body (necessary for Firefox)
        document.body.appendChild(a);

        // Programmatically click the link to trigger the download
        a.click();

        // Remove the link from the document
        document.body.removeChild(a);

        // Revoke the Blob URL to free up resources
        URL.revokeObjectURL(url);
    }
</script>

<!-- <textarea value={consol}></textarea> -->
<!-- 
<div class="gradient-bg">
    <div class="gradients-container extra">
        <div id="g1-3_1" class="g" />
        <div id="g1-2_1" class="g" />
        <div id="g1-1_1" class="g" />
        <div id="g1-7_1" class="g" />
    </div>
</div> -->

<div class="main">
    {#if verified.length > 0}
        <form action="?/verify" method="post" use:enhance={handleverifyres}>
            <button class="submit">Verify</button>
        </form>
    {/if}
    {#if deleted.length > 0}
        <form action="?/unverify" method="post" use:enhance={handleunverifyres}>
            <button class="submit">Delete</button>
        </form>
    {/if}
    <select on:change={handleChange}>
        <option value="Unverified">Unverified</option>
        <option value="Verified">Verified</option>
        {#each eventList as e}
            <option value={e}>{e}</option>
        {/each}
    </select>
    <button on:click={downloadCSV}>Download CSV</button>
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
                    {#if payment.amount != null}
                        <tr>
                            <td>{payment.event}</td>
                            <td>{payment.name}</td>
                            <td>{payment.CA}</td>
                            <td>{payment.transId}</td>
                            <td>{payment.parts}</td>
                            <td>{payment.amount}</td>
                        </tr>
                    {/if}
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
                    <th>Delete</th>
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
                        <td
                            ><input
                                type="checkbox"
                                on:change={(e) => {
                                    // @ts-ignore
                                    if (e?.target?.checked) {
                                        deleted.push(payment.transId);
                                        deleted = deleted;
                                    } else {
                                        deleted = deleted.filter(
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
    .main {
        z-index: 2;
        position: relative;
    }
    select {
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
