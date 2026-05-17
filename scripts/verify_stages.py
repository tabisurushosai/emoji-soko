#!/usr/bin/env python3
# Development-only: ステージ solvability 検証ツール。
# 配布 zip (build_zip.sh) には含めない。
#
# Usage:
#   python3 scripts/verify_stages.py [stage_dir] [start] [end]
# Default: stages/ 61 100
#
# BFS で状態空間を探索し、各ステージが解可能かを判定する。
# 1ステージあたりノード上限 200000 / タイムアウト 30 秒で打ち切り、
# 打ち切られたものは "unverified" として報告する。
# 角デッドロック (goal でないコーナーに押し込まれた箱) は枝刈り。

import sys
import time
from collections import deque
from pathlib import Path

DIRS = [(0, -1), (0, 1), (-1, 0), (1, 0)]
NODE_CAP = 200_000
TIME_CAP = 30.0


def parse_stage(text):
    lines = text.rstrip("\n").split("\n")
    walls = set()
    goals = set()
    boxes = []
    player = None
    height = len(lines)
    width = max((len(l) for l in lines), default=0)
    for y, row in enumerate(lines):
        for x, ch in enumerate(row):
            if ch == "#":
                walls.add((x, y))
            elif ch == "@":
                player = (x, y)
            elif ch == "P":
                player = (x, y)
                goals.add((x, y))
            elif ch == "$":
                boxes.append((x, y))
            elif ch == "*":
                goals.add((x, y))
            elif ch == "B":
                boxes.append((x, y))
                goals.add((x, y))
    return walls, goals, tuple(sorted(boxes)), player, width, height


def compute_dead_cells(walls, goals, width, height):
    dead = set()
    for y in range(height):
        for x in range(width):
            if (x, y) in walls or (x, y) in goals:
                continue
            l = (x - 1, y) in walls
            r = (x + 1, y) in walls
            u = (x, y - 1) in walls
            d = (x, y + 1) in walls
            if (l and u) or (r and u) or (l and d) or (r and d):
                dead.add((x, y))
    return dead


def solve(text):
    walls, goals, init_boxes, player, width, height = parse_stage(text)
    if player is None:
        return ("error", 0, 0.0, "no player", None)
    if len(init_boxes) != len(goals):
        return (
            "error",
            0,
            0.0,
            f"box/goal count mismatch ({len(init_boxes)} vs {len(goals)})",
            None,
        )

    goals_fs = frozenset(goals)
    dead = compute_dead_cells(walls, goals, width, height)

    if all(b in goals_fs for b in init_boxes):
        return ("solvable", 0, 0.0, "already solved", 0)

    init_state = (player, init_boxes)
    visited = {init_state}
    queue = deque([(player, init_boxes, 0)])
    nodes = 0
    start = time.monotonic()

    while queue:
        if nodes >= NODE_CAP:
            return ("unverified", nodes, time.monotonic() - start, "node cap", None)
        if time.monotonic() - start > TIME_CAP:
            return ("unverified", nodes, time.monotonic() - start, "timeout", None)
        (px, py), boxes, moves = queue.popleft()
        nodes += 1
        box_set = set(boxes)
        for dx, dy in DIRS:
            nx, ny = px + dx, py + dy
            if (nx, ny) in walls:
                continue
            new_boxes = boxes
            if (nx, ny) in box_set:
                bx, by = nx + dx, ny + dy
                if (bx, by) in walls or (bx, by) in box_set:
                    continue
                if (bx, by) in dead:
                    continue
                new_box_list = list(boxes)
                idx = new_box_list.index((nx, ny))
                new_box_list[idx] = (bx, by)
                new_box_list.sort()
                new_boxes = tuple(new_box_list)
            state = ((nx, ny), new_boxes)
            if state in visited:
                continue
            visited.add(state)
            if all(b in goals_fs for b in new_boxes):
                return (
                    "solvable",
                    nodes,
                    time.monotonic() - start,
                    f"{moves + 1} moves",
                    moves + 1,
                )
            queue.append(((nx, ny), new_boxes, moves + 1))

    return ("unsolvable", nodes, time.monotonic() - start, "exhausted", None)


def main():
    args = sys.argv[1:]
    stage_dir = Path(args[0]) if len(args) >= 1 else Path("stages")
    start_n = int(args[1]) if len(args) >= 2 else 61
    end_n = int(args[2]) if len(args) >= 3 else 100

    results = []
    for n in range(start_n, end_n + 1):
        name = f"{n:02d}.txt" if n < 100 else f"{n}.txt"
        path = stage_dir / name
        if not path.exists():
            results.append((n, "missing", 0, 0.0, "not found"))
            print(f"[{n:3d}] MISSING ({name})")
            continue
        text = path.read_text()
        status, nodes, elapsed, info, _moves = solve(text)
        results.append((n, status, nodes, elapsed, info))
        print(
            f"[{n:3d}] {status:>10s}  nodes={nodes:>7d}  t={elapsed:6.2f}s  {info}"
        )

    total = len(results)
    solvable = [r for r in results if r[1] == "solvable"]
    unsolvable = [r for r in results if r[1] == "unsolvable"]
    unverified = [r for r in results if r[1] == "unverified"]
    errors = [r for r in results if r[1] in ("error", "missing")]

    print()
    print(f"Total:      {total}")
    print(f"Solvable:   {len(solvable)}")
    print(f"Unsolvable: {len(unsolvable)}")
    print(f"Unverified: {len(unverified)}  (node cap or timeout)")
    print(f"Errors:     {len(errors)}")
    if unsolvable:
        print("UNSOLVABLE:", ", ".join(str(r[0]) for r in unsolvable))
    if unverified:
        print("UNVERIFIED:", ", ".join(str(r[0]) for r in unverified))
    if errors:
        print("ERRORS:", ", ".join(f"{r[0]}({r[4]})" for r in errors))

    sys.exit(0 if not (unsolvable or errors) else 1)


if __name__ == "__main__":
    main()
