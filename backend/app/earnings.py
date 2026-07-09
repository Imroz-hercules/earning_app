from .models import TaskSubmission, WithdrawalRequest


def get_user_earnings(user_id: str) -> dict:
    approved_submissions = TaskSubmission.query.filter_by(user_id=user_id, status="approved").all()
    total_earning = sum(float(submission.task.reward or 0) for submission in approved_submissions if submission.task)

    active_withdrawals = WithdrawalRequest.query.filter(
        WithdrawalRequest.user_id == user_id,
        WithdrawalRequest.status.in_(["pending", "approved"]),
    ).all()
    reserved = sum(float(withdrawal.amount) for withdrawal in active_withdrawals)
    pending_withdrawal = sum(
        float(withdrawal.amount) for withdrawal in active_withdrawals if withdrawal.status == "pending"
    )
    withdrawn = sum(
        float(withdrawal.amount) for withdrawal in active_withdrawals if withdrawal.status == "approved"
    )

    return {
        "total_earning": round(total_earning, 2),
        "available_balance": round(max(0, total_earning - reserved), 2),
        "pending_withdrawal": round(pending_withdrawal, 2),
        "withdrawn": round(withdrawn, 2),
    }
