from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.goal import Goal
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalRead, GoalUpdate

router = APIRouter(prefix="/goals", tags=["goals"])


def _goal_read(goal: Goal) -> GoalRead:
    data = GoalRead.model_validate(goal)
    progress = float(goal.current_amount / goal.target_amount * 100) if goal.target_amount else 0
    return data.model_copy(update={"progress_pct": round(progress, 2)})


@router.get("", response_model=list[GoalRead])
def list_goals(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[GoalRead]:
    goals = list(db.scalars(select(Goal).where(Goal.owner_id == current_user.id)))
    return [_goal_read(goal) for goal in goals]


@router.post("", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: GoalCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GoalRead:
    goal = Goal(**payload.model_dump(), owner_id=current_user.id)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _goal_read(goal)


@router.patch("/{goal_id}", response_model=GoalRead)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GoalRead:
    goal = db.get(Goal, goal_id)
    if not goal or goal.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Goal not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)
    db.commit()
    db.refresh(goal)
    return _goal_read(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    goal = db.get(Goal, goal_id)
    if not goal or goal.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
