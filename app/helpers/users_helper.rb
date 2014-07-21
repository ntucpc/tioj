module UsersHelper
  def user_ac_count(user)
    return Submission.select("problem_id").distinct.where("contest_id is NULL AND user_id = ? AND result = ?", user.id, "AC").count
  end
  
  def ac_ratio_by_user(user)
    all = user.submissions.where("contest_id is NULL")
    ac = all.where("result = ?", "AC")
    all = all.count
    ac = ac.count
    ratio = "%.1f%%" % (100.0 * ac / all)
    ac_page = link_to ac, submissions_path(:filter_user_id => user.id, :'filter_status[]' => "AC")
    all_page = link_to all, submissions_path(:filter_user_id => user.id)
    return raw ( ratio + " (" + ac_page + "/" + all_page + ")" )
  end
  
  def user_problem_ac(user, problem)
    if Submission.where("contest_id is NULL AND user_id = ? AND problem_id = ? AND result = ?", user.id, problem.id, "AC").count == 0
      return false
    else
      return true
    end
  end
  
  def user_problem_tried(user, problem)
    if Submission.where("contest_id is NULL AND user_id = ? AND problem_id = ?", user.id, problem.id).count == 0
      return false
    else
      return true
    end
  end
  
end
