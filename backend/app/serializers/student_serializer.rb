# app/serializers/student_serializer.rb
class StudentSerializer
    include JSONAPI::Serializer
    attributes :id, :name, :email, :classroom_id
end
