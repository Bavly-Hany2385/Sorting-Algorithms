import sys
import os
import glob
import argparse
import warnings

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

warnings.filterwarnings("ignore")

COL_ALGO   = "Algorithm Name"
COL_SOURCE = "Array Source"
COL_AVG    = "Average Runtime (ns)"   
COL_COMP   = "Comparisons"
COL_SWAP   = "Interchanges"

def load_csv(path):
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()

    # Auto-detect runtime column in case the header wording differs slightly
    global COL_AVG
    if COL_AVG not in df.columns:
        candidates = [c for c in df.columns if "avg" in c.lower() or "average" in c.lower()]
        if candidates:
            COL_AVG = candidates[0]
            print(f"  Auto-detected avg runtime column: '{COL_AVG}'")
        else:
            print(f"  ERROR: Cannot find an average runtime column.")
            print(f"  Columns in file: {list(df.columns)}")
            sys.exit(1)

    for col in [COL_AVG, COL_COMP, COL_SWAP]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df

# Colours — one per array source (up to 8 sources supported)
PALETTE = ["#5B8DD9", "#E07B54", "#5DB87A", "#C97DD4", "#E8C34A", "#6ECFCF", "#D96B6B", "#A0A0A0"]


def plot(df, csv_name):
    sources   = sorted(df[COL_SOURCE].unique())
    algos     = sorted(df[COL_ALGO].unique())
    n_algos   = len(algos)
    n_sources = len(sources)

    x         = range(n_algos)
    bar_width = 0.8 / n_sources           
    colors    = PALETTE[:n_sources]

    fig, axes = plt.subplots(3, 1, figsize=(12, 14))
    fig.suptitle(f"Sortalyze — Sorting Algorithm Comparison\n{csv_name}",
                 fontsize=14, fontweight="bold", y=0.98)

    metrics = [
        (axes[0], COL_AVG,  "Average Runtime (ms)",       True),   # True = convert ns to ms
        (axes[1], COL_COMP, "Number of Comparisons",      False),
        (axes[2], COL_SWAP, "Number of Interchanges",     False),
    ]

    for ax, col, ylabel, convert in metrics:
        for s_idx, source in enumerate(sources):
            subset = df[df[COL_SOURCE] == source]

            # Get value per algorithm (mean in case of duplicates)
            values = []
            for algo in algos:
                row = subset[subset[COL_ALGO] == algo][col]
                val = row.mean() if not row.empty else 0
                if convert:
                    val = val / 1_000_000   # from ns to ms
                values.append(val)

            # Offset each source's bars side by side
            offsets = [xi + s_idx * bar_width - (n_sources - 1) * bar_width / 2
                       for xi in x]

            bars = ax.bar(offsets, values, width=bar_width,
                          label=source, color=colors[s_idx],
                          edgecolor="white", linewidth=0.5)

            # Value labels on top of each bar
            for bar, val in zip(bars, values):
                if val > 0:
                    label = f"{val:.2f}" if convert else f"{int(val):,}"
                    ax.text(
                        bar.get_x() + bar.get_width() / 2,
                        bar.get_height() * 1.01,
                        label,
                        ha="center", va="bottom",
                        fontsize=6.5, color="#333333"
                    )

        ax.set_ylabel(ylabel, fontsize=10)
        ax.set_xticks(list(x))
        ax.set_xticklabels(algos, fontsize=9, rotation=15, ha="right")
        ax.yaxis.set_major_formatter(mticker.FuncFormatter(
            lambda v, _: f"{v:.2f}" if convert else f"{int(v):,}"
        ))
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.6)
        ax.set_axisbelow(True)
        ax.legend(title="Array Source", fontsize=8, title_fontsize=8,
                  loc="upper right", framealpha=0.8)

    plt.tight_layout(rect=[0, 0, 1, 0.96])
    plt.show()

def find_latest_csv(directory="."):
    csvs = glob.glob(os.path.join(directory, "*.csv"))
    return max(csvs, key=os.path.getmtime) if csvs else None

def main():
    parser = argparse.ArgumentParser(
        description="Plot Sortalyze comparison CSV results."
    )
    parser.add_argument(
        "path", nargs="?", default=None,
        help="Path to CSV file. Defaults to latest CSV in current directory."
    )
    args = parser.parse_args()

    if args.path is None:
        path = find_latest_csv(".")
        if path is None:
            print("ERROR: No CSV files found in the current directory.")
            sys.exit(1)
        print(f"Auto-selected: {path}")
    elif os.path.isfile(args.path):
        path = args.path
    else:
        print(f"ERROR: '{args.path}' is not a valid file.")
        sys.exit(1)

    df = load_csv(path)

    if df.empty:
        print("ERROR: CSV is empty or could not be parsed.")
        sys.exit(1)

    plot(df, os.path.basename(path))

if __name__ == "__main__":
    main()