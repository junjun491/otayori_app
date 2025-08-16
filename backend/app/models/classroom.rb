class Classroom < ApplicationRecord
  belongs_to :teacher
  has_many :invitations, dependent: :destroy, inverse_of: :classroom
end
