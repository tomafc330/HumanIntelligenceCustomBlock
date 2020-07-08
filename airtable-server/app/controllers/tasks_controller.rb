require 'aws-sdk'

class TasksController < ApplicationController
  before_action :set_instance

  protect_from_forgery with: :null_session, only: Proc.new { |c| c.request.format.json? }
  protect_from_forgery with: :exception, prepend: true
  protect_from_forgery prepend: true

  def index
    results = []
    tasks = Task.where(base_id: params[:base_id])
    tasks.each do |task|
      responses = get_responses(task.hit_id).map { |r| parse_answer r.answer }
      results << {cell_id: task.cell_id, hit_id: task.hit_id, question: task.question, question_raw: task.question_raw, responses: responses} unless responses.empty?
    end

    render json: results
  end

  # key, secret, base id, cell id, question, hit_id, numRequested
  def create
    params = JSON.parse(request.body.read)
    question = params['question']
    cost = params['cost']
    num_tasks_requested = params['num_tasks_requested'] || 2

    # Step 1) Get your favorite HTML question
    my_html_question = p %{
  <HTMLQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2011-11-11/HTMLQuestion.xsd">
    <HTMLContent><![CDATA[<!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/>
          <script type='text/javascript' src='https://s3.amazonaws.com/mturk-public/externalHIT_v1.js'></script>
        </head>
        <body>
          <form name='mturk_form' method='post' id='mturk_form' action='https://www.mturk.com/mturk/externalSubmit'>
            <input type='hidden' value='' name='assignmentId' id='assignmentId'/>
            <h1>#{question}</h1>
            <p><textarea name='comment' cols='80' rows='3'></textarea></p>
            <p><input type='submit' id='submitButton' value='Submit' /></p>
          </form>
          <script language='Javascript'>turkSetAssignmentID();</script>
        </body>
      </html>]]>
    </HTMLContent>
    <FrameHeight>450</FrameHeight>
  </HTMLQuestion>
}.gsub(/\s+/, " ").strip

    result = @instance.create_hit(
        lifetime_in_seconds: 60 * 60 * 24,
        assignment_duration_in_seconds: 120,
        max_assignments: num_tasks_requested,
        reward: cost.to_s,
        title: "Human Intelligence Block Task ##{(0...8).map { (65 + rand(26)).chr }.join}",
        description: question,
        question: my_html_question,
    )

    Task.find_or_create_by!(
        base_id: params['base_id'],
        cell_id: params['cell_id'],
        question: question,
        question_raw: params['question_raw'],
        hit_id: result.hit.hit_id,
        num_tasks_requested: num_tasks_requested
    )

    render json: true
  end

  def complete
    params = JSON.parse(request.body.read)

    task = Task.where(base_id: params['base_id'], cell_id: params['cell_id']).first

    unless task
      render json: false
      return
    end

    approve_all_submitted_assignments(task.hit_id)
    delete_my_hit(task.hit_id)

    task.destroy

    render json: true
  end

  private

  def approve_all_submitted_assignments(hit_id)
    begin
      get_responses(hit_id).each do |assignment|
        @instance.approve_assignment(
            assignment_id: assignment.assignment_id,
            requester_feedback: 'Thanks for the great work!'
        )
      end
    rescue Exception => e
      puts "ERROR! #{e}"
    end
  end

  def get_responses(hit_id)
    # NOTE: If you have more than 100 results, you'll need to page through using
    # a unique pagination token
    begin
      @instance.list_assignments_for_hit(hit_id: hit_id).assignments
    rescue Exception => e
      puts "ERROR! #{e.message}"
      []
    end
  end

  def delete_my_hit(hit_id)
    begin
      @instance.delete_hit(hit_id: hit_id)
    rescue Aws::MTurk::Errors::RequestError => e
      puts "DID NOT DELETE: This hit still has unsubmitted assigments."
    rescue Exception => e
      puts "ERROR! #{e}"
    end
  end

  def set_instance
    endpoint = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com'
    # endpoint = 'https://mturk-requester.us-east-1.amazonaws.com'

    credentials = Aws::Credentials.new(request.headers['aws-key'], request.headers['aws-secret'])
    @instance = Aws::MTurk::Client.new(endpoint: endpoint, credentials: credentials, region: 'us-east-1')
  end

  def parse_answer string
    doc = Nokogiri::XML(string)
    return doc.css("FreeText").first.content
  end
end
