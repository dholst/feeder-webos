require 'json'

task :default => :run

desc "install and run the application on the emulator or device"
task :run => ['install', 'launch', 'tail']

task :launch do
  puts system("palm-launch -i #{app_id}")
end

task :tail do
  system("palm-log -f #{app_id}")
end

desc 'package the application'
task :package do
  puts system('palm-package -o /tmp . --exclude-from="config/excludes.txt"')
end

desc 'install the application on the emulator'
task :install => :package do
  puts system("palm-install -r #{app_id}")
  puts system("palm-install /tmp/#{app_id}_#{version}_all.ipk")
end

def app_info
  @app_info ||= JSON.parse(File.open('appinfo.json').read)
end

def app_id
  app_info['id']
end

def version
  app_info['version']
end

namespace :jasmine do
  require 'jasmine'

  desc "Run continuous integration tests"
  require "spec"
  require 'spec/rake/spectask'

  Spec::Rake::SpecTask.new(:ci) do |t|
    t.spec_opts = ["--color", "--format", "specdoc"]
    t.verbose = true
    t.spec_files = ['spec/support/jasmine_runner.rb']
  end

  task :server do
    require 'spec/support/jasmine_config'
    Jasmine::Config.new.start_server
  end
end

desc "Run specs via server"
task :jasmine => ['jasmine:server']
