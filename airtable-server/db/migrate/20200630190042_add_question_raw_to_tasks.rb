class AddQuestionRawToTasks < ActiveRecord::Migration[5.1]
  def change
    add_column :tasks, :question_raw, :text
  end
end
