class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages do |t|
      t.string :title
      t.text :content
      t.integer :status
      t.datetime :published_at
      t.date :deadline
      t.references :classroom, null: false, foreign_key: true
      t.references :teacher, null: false, foreign_key: true

      t.timestamps
    end
  end
end
