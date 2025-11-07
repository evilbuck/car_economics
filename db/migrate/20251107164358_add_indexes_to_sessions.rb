class AddIndexesToSessions < ActiveRecord::Migration[8.0]
  def change
    add_index :sessions, :user_id
    add_index :sessions, :created_at
  end
end
