<script lang="ts">
  let { classes = [], matrix = [] }: { classes?: string[]; matrix?: number[][] } = $props();
  // compute totals and percentages
  function getRowTotal(row: number[]) {
    return row.reduce((a, b) => a + b, 0);
  }
</script>

<style>
  .confusion-table {
    width: 100%;
    border-collapse: collapse;
  }
  .confusion-table th, .confusion-table td {
    border: 1px solid rgba(0,0,0,0.08);
    padding: 6px 8px;
    text-align: center;
    font-size: 12px;
  }
  .confusion-table th {
    background: rgba(0,0,0,0.04);
  }
  .confusion-cell {
    min-width: 60px;
  }
</style>

{#if classes.length && matrix.length}
  <div class="confusion-matrix-container">
    <table class="confusion-table">
      <thead>
        <tr>
          <th></th>
          {#each classes as c (c)}
            <th title={c}>{c}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each matrix as row, i (classes[i])}
          {@const total = getRowTotal(row)}
          <tr>
            <th>{classes[i]}</th>
            {#each row as cell, j (j)}
              <td class="confusion-cell">
                {cell}
                <div style="font-size:10px;color:#666;">{total > 0 ? ((cell / total) * 100).toFixed(0) + '%' : '-'}</div>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
