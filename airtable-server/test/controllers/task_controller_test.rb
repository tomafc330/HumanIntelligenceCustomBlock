require 'test_helper'

class TaskControllerTest < ActionDispatch::IntegrationTest
  test "should get index,create,complete" do
    get task_index,create,complete_url
    assert_response :success
  end

end
