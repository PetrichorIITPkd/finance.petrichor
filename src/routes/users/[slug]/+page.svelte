<script lang="ts">
    import Loading from "$lib/components/Loading.svelte";
    import type { userData } from "$lib/types";
    import { onMount } from "svelte";
    export let data: any;

    let userData: userData = data.data;
    let loading = true;
    let state = "All"
    let user_type = false
    let CADataLen = 0;
    let unverified_len= 0;
    onMount(() => {
        CADataLen = userData.filter((e) => {
            if (!e.verified) {
                unverified_len +=1
            }
            if (e.CA != ""){
                return e
            }
        }).length
        loading = false;
    });

    

     // Function to download the dictionary as a JSON file
     function downloadCSV() {
            // Convert the dictionary to JSON string
            // const jsonString = JSON.stringify(myDict, null, 2);

            // Extract headers (keys) and values (rows) from the dictionary
            const headers = "Name,Phone,Email,GradYear,Stream,Joined,college,CACode,CAregistrations"; // "name,age,city"
            const values = userData.map((e)=>{
                if (state == "Only CA" && e.CA == ""){
                    return
                }
                return Object.values(e).join(","); // "John Doe,30,New York"
            })

            // Combine headers and values into CSV format
            const csvString = `${headers}\n${values.join('\n')}`;

            // Create a Blob with the JSON data
            const blob = new Blob([csvString], { type: "text/csv" });

            // Create a URL for the Blob
            const url = URL.createObjectURL(blob);

            // Create a link element
            const a = document.createElement("a");
            a.href = url;

            // Set the download attribute with a filename
            if (state == "All")
                a.download = "petrichor.csv";
            else 
                a.download = "petrichorCA.csv";

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


<div class="main">
    <select on:change={(e)=>{
        const target = e.target;
        // @ts-ignore
        state = target.value;
    }}>
        <option value="All">All</option>
        <option value="Only CA">Only CA</option>
    </select>
    {#if state == "All"}
    <div>
        <label>Unverified</label>
        <input type="checkbox" on:input={(e) => {user_type = !user_type}}>
    </div>
    {/if}
    <button on:click={downloadCSV} >Download CSV</button>
    
    <div class="tb">
            Count : {state == "All" ? user_type ? unverified_len :  userData.length : CADataLen}
            <table>
                <tr>
                    <th>Name</th>
                    <th>email</th>
                    <th>phone</th>
                    <th>college</th>
                    <th>stream</th>
                    <th>gradyear</th>
                    <th>CACode</th>
                    <th>CAregistrations</th>
                    <th>joined</th>
                    <th>Verified</th>
                </tr>
                {#each userData as user}
                    {#if ((state == "Only CA" && user.CA != "") || (state == "All" && (!user_type || (!user.verified))))     }
                    <tr>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.college}</td>
                        <td>{user.stream}</td>
                        <td>{user.gradyear}</td>
                        <td>{user.CA}</td>
                        <td>{user.CAregistrations}</td>
                        <td>{user.joined}</td>
                        <td>{user.verified}</td>
                    </tr>
                    {/if}
                {/each}
            </table>
    </div>
</div>

<Loading spinning={loading} />
<style>
    .main{
        z-index: 2;
        overflow-x: scroll;
        position: relative;
    }
    select{
        padding: 10px;
        background-color: rgba(191, 248, 248, 0.499);
    }
    table {
        border: 2px solid rgba(25, 25, 179, 0.562);
        overflow-x: visible;
        width: 100%;
        background-color: rgba(29, 70, 120, 0.374);
    }

    th {
        padding: 30px;
        height: 100%;
        background-color: rgba(40, 97, 171, 0.684);
    }
    td {
        text-align: center;
        overflow-x: visible  ;
        padding: 10px 20px;
        border-right: 2px rgba(104, 151, 187, 0.623) solid;
    }
    .tb {
        z-index: 3;
        overflow-x: visible;
    }
</style>
