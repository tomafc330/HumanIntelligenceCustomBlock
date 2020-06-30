class CreateTasks < ActiveRecord::Migration[5.1]
  def change
    create_table :tasks do |t|
      t.string :base_id
      t.string :cell_id
      t.string :hit_id
      t.integer :num_tasks_requested

      t.timestamps
    end
  end
end
