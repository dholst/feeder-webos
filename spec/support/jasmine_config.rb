require 'jasmine'

class Jasmine::Config

# Override these methods if necessary

#  def project_root
#    Dir.pwd
#  end

#  Path to your jasmine.yml
#  def simple_config_file
#    File.join(project_root, 'spec/javascripts/support/jasmine.yml')
#  end

#  Source directory path. Your src_files must be returned relative to this path.
#  def src_dir
#    if simple_config['src_dir']
#      File.join(project_root, simple_config['src_dir'])
#    else
#      project_root
#    end
#  end

  def spec_dir
    return File.join(project_root, 'spec')
  end

  def src_files
    files = match_files(project_root, "framework/**/*.js")

    File.open(File.join(project_root, "sources.json"), "r") { |file|
      files.concat file.read.scan(/"([^"]*\.js)/).map{|match| match[0]}
    }

    files
  end

#  Return an array of filepaths relative to spec_dir to include before jasmine specs.
#  def spec_files
#    files = match_files(spec_dir, "**/*.js")
#    if simple_config['spec_files']
#      files = simple_config['spec_files'].collect {|filepath| Dir.glob(filepath)}
#    end
#    files
#  end

#  Return an array of filepaths relative to src_dir to include before jasmine specs.
  # def stylesheets
  #   return match_files(project_root, "spec/support/**/*.css")
  # end

end
