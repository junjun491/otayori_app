class AddNameToTeachers < ActiveRecord::Migration[8.0]
  def change
    add_column :teachers, :name, :string
  end
end
