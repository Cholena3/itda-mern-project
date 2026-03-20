import time
import os
import sys

# ─── ANSI Colors ───
RESET   = "\033[0m"
BOLD    = "\033[1m"
DIM     = "\033[2m"
RED     = "\033[91m"
GREEN   = "\033[92m"
YELLOW  = "\033[93m"
BLUE    = "\033[94m"
MAGENTA = "\033[95m"
CYAN    = "\033[96m"
WHITE   = "\033[97m"
BG_GREEN  = "\033[42m"
BG_RED    = "\033[41m"
BG_BLUE   = "\033[44m"
BG_YELLOW = "\033[43m"

DOCK_COLORS = [CYAN, MAGENTA, YELLOW, GREEN, BLUE, RED]

DELAY = 0.4  # seconds between steps


def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def bar(value, max_val, width=30, fill_char="█", empty_char="░"):
    filled = int(width * value / max_val) if max_val > 0 else 0
    return fill_char * filled + empty_char * (width - filled)


def print_header(weights, priorities, K):
    print(f"\n{BOLD}{'═' * 60}{RESET}")
    print(f"{BOLD}   ⚙  THE PRIORITY-AWARE WAREHOUSE DISPATCHER  ⚙{RESET}")
    print(f"{BOLD}{'═' * 60}{RESET}")
    print(f"\n  {DIM}Packages:{RESET}  {len(weights)}")
    print(f"  {DIM}Docks:{RESET}     {K}")
    print(f"  {DIM}Weights:{RESET}   {weights}")
    print(f"  {DIM}Priorities:{RESET} {priorities}")
    print()


def print_binary_search_state(lo, hi, mid, result, iteration):
    width = 50
    range_size = hi - lo + 1 if hi > lo else 1
    mid_pos = int(width * (mid - lo) / range_size) if range_size > 1 else width // 2

    print(f"  {BOLD}Binary Search — Iteration {iteration}{RESET}")
    print(f"  lo={BLUE}{lo}{RESET}  hi={BLUE}{hi}{RESET}  mid={YELLOW}{BOLD}{mid}{RESET}", end="")
    if result:
        print(f"  → {GREEN}✓ fits{RESET}")
    else:
        print(f"  → {RED}✗ too small{RESET}")

    # Visual number line
    ruler = list("─" * width)
    if 0 <= mid_pos < width:
        ruler[mid_pos] = "▼"
    print(f"  {lo} {''.join(ruler)} {hi}")
    print()

def visualize_dispatch(weights, priorities, K, M, animate=True):
    """Simulate and visualize dock assignment for a given capacity M."""
    n = len(weights)
    docks = []  # list of lists: each dock holds [(weight, priority, pkg_index), ...]
    current_dock = []
    current_weight = 0
    current_priority = -float('inf')
    dock_index = 0
    success = True

    print(f"  {BOLD}Simulating M = {M}{RESET}")
    print(f"  {'─' * 56}")

    for i in range(n):
        w, p = weights[i], priorities[i]

        if w > M:
            print(f"  {RED}✗ Pkg {i+1} (Wt:{w}) exceeds capacity {M}{RESET}")
            success = False
            break

        fits_weight = (current_weight + w <= M)
        fits_priority = (p >= current_priority)

        if fits_weight and fits_priority:
            current_dock.append((w, p, i))
            current_weight += w
            current_priority = p
            color = DOCK_COLORS[dock_index % len(DOCK_COLORS)]
            pct = current_weight / M * 100
            print(f"  {color}Dock {dock_index+1}{RESET} ← Pkg {i+1} "
                  f"(Wt:{w}, Pr:{p})  "
                  f"[{bar(current_weight, M, 20)}] "
                  f"{current_weight}/{M} ({pct:.0f}%)")
        else:
            reason = ""
            if not fits_priority:
                reason = f"Priority {p} < {int(current_priority)}"
            elif not fits_weight:
                reason = f"Weight {current_weight}+{w} > {M}"
            color = DOCK_COLORS[dock_index % len(DOCK_COLORS)]
            print(f"  {DIM}  └─ {reason} → seal Dock {dock_index+1}{RESET}")

            docks.append(current_dock)
            dock_index += 1