class CreateSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :sessions do |t|
      t.integer :user_id
      t.json :meta

      t.timestamps
    end
  end
end
