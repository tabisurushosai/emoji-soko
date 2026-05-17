#!/usr/bin/env python3
# Development-only: ステージ solvability 検証 (本番未同梱)
# Run: python3 scripts/verify_stages.py [stage_dir] [start] [end]
#
# Push-BFS: プレイヤー位置を到達可能領域の代表座標 (最小 (y,x)) に正規化し、
# 状態 = (代表座標, sorted boxes)。1状態あたり「box を 1 マス押す」遷移のみを列挙する。
# Move-BFS と比べ状態数が劇的に少ない。角デッドロックは枝刈り。
# 1 ステージあたりノード上限 600,000 / タイムアウト 60 秒。

import sys
import time
from collections import deque
from pathlib import Path

DIRS = [(0, -1), (0, 1), (-1, 0), (1, 0)]
NODE_CAP = 600_000
TIME_CAP = 60.0


def stage_path(stage_dir: Path, n: int) -> Path:
    return stage_dir / f"{n:02d}.txt"


def parse_stage(text):
    lines = text.rstrip("\n").split("\n")
    walls = set()
    goals = set()
    boxes = []
    player = None
    height = len(lines)
    width = max((len(line) for line in lines), default=0)

    for y, row in enumerate(lines):
        for x, ch in enumerate(row):
            if ch == "#":
                walls.add((x, y))
            elif ch in ("@", "P"):
                player = (x, y)
                if ch == "P":
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
            left = (x - 1, y) in walls
            right = (x + 1, y) in walls
            up = (x, y - 1) in walls
            down = (x, y + 1) in walls
            if (left and up) or (right and up) or (left and down) or (right and down):
                dead.add((x, y))
    return dead


def player_reachable(player, boxes_set, walls):
    visited = {player}
    stack = [player]
    while stack:
        x, y = stack.pop()
        for dx, dy in DIRS:
            nxt = (x + dx, y + dy)
            if nxt in walls or nxt in boxes_set or nxt in visited:
                continue
            visited.add(nxt)
            stack.append(nxt)
    return visited


def canonical(reachable):
    return min(reachable, key=lambda p: (p[1], p[0]))


def solve(text):
    walls, goals, init_boxes, player, width, height = parse_stage(text)
    if player is None:
        return "error", None, "no player"
    if len(init_boxes) != len(goals):
        return "error", None, f"box/goal mismatch ({len(init_boxes)} vs {len(goals)})"

    goals_fs = frozenset(goals)
    dead = compute_dead_cells(walls, goals, width, height)

    if all(b in goals_fs for b in init_boxes):
        return "solved", 0, "already solved"

    init_boxes_set = frozenset(init_boxes)
    init_reach = player_reachable(player, init_boxes_set, walls)
    init_canon = canonical(init_reach)
    visited = {(init_canon, init_boxes)}
    queue = deque([(init_boxes, init_reach, 0)])
    nodes = 0
    start = time.monotonic()

    while queue:
        if nodes >= NODE_CAP:
            return "fail", None, "node cap"
        if time.monotonic() - start > TIME_CAP:
            return "fail", None, "timeout"

        boxes, reach, pushes = queue.popleft()
        nodes += 1
        boxes_set = set(boxes)

        for i, (bx, by) in enumerate(boxes):
            for dx, dy in DIRS:
                stand = (bx - dx, by - dy)
                if stand not in reach:
                    continue
                dest = (bx + dx, by + dy)
                if dest in walls or dest in boxes_set:
                    continue
                if dest in dead:
                    continue

                new_list = list(boxes)
                new_list[i] = dest
                new_list.sort()
                new_boxes = tuple(new_list)

                if all(b in goals_fs for b in new_boxes):
                    return "solved", pushes + 1, f"{pushes + 1} pushes"

                new_boxes_set = frozenset(new_boxes)
                new_reach = player_reachable((bx, by), new_boxes_set, walls)
                new_canon = canonical(new_reach)
                state = (new_canon, new_boxes)
                if state in visited:
                    continue
                visited.add(state)
                queue.append((new_boxes, new_reach, pushes + 1))

    return "fail", None, "exhausted"


def format_line(n: int, status: str, steps, info: str) -> str:
    label = f"STAGE_{n:02d}"
    if status == "solved":
        return f"✓ {label} solved (steps={steps})"
    if status == "missing":
        return f"✗ {label} UNSOLVABLE_OR_TIMEOUT (missing file)"
    return f"✗ {label} UNSOLVABLE_OR_TIMEOUT ({info})"


def main():
    args = sys.argv[1:]
    stage_dir = Path(args[0]) if args else Path("stages")
    start_n = int(args[1]) if len(args) > 1 else 1
    end_n = int(args[2]) if len(args) > 2 else 100

    solved_count = 0
    failed = []

    for n in range(start_n, end_n + 1):
        path = stage_path(stage_dir, n)
        if not path.exists():
            line = format_line(n, "missing", None, "not found")
            print(line)
            failed.append((n, "missing"))
            continue

        status, steps, info = solve(path.read_text())
        line = format_line(n, status, steps, info)
        print(line)

        if status == "solved":
            solved_count += 1
        else:
            failed.append((n, info))

    total = end_n - start_n + 1
    fail_count = len(failed)
    print()
    print(f"SUMMARY solved={solved_count} failed={fail_count} total={total}")
    if failed:
        names = ", ".join(stage_path(stage_dir, n).name for n, _ in failed)
        print(f"FAILED_FILES: {names}")

    sys.exit(0 if fail_count == 0 else 1)


if __name__ == "__main__":
    main()
