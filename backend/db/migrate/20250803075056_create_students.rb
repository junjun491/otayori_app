class CreateStudents < ActiveRecord::Migration[8.0]
  def change
    create_table :students do |t|
      t.string :name
      t.string :email
      t.references :classroom, null: false, foreign_key: true
      t.string :encrypted_password

      t.timestamps
    end
  end
end
